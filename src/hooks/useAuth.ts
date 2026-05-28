import { useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { getUserProfile, createUserProfile } from '../lib/firestore'
import type { UserProfile, Subject, DifficultyLevel } from '../types'

// Traduz código de erro do Firebase para mensagem amigável
function parseFirebaseError(code: string): string {
    const map: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
        'auth/user-not-found': 'E-mail não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        'auth/configuration-not-found': 'Firebase não configurado. Verifique as variáveis de ambiente.',
        'auth/api-key-not-valid': 'Chave do Firebase inválida. Verifique o .env.',
    }
    return map[code] ?? `Erro inesperado (${code}). Tente novamente.`
}

interface AuthState {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    error: string | null
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        loading: true,
        error: null,
    })

    useEffect(() => {
        // Timeout de segurança: se o Firebase não responder em 6s, libera a tela de login
        const fallback = setTimeout(() => {
            setState(s => s.loading ? { ...s, loading: false } : s)
        }, 6000)

        const unsub = onAuthStateChanged(
            auth,
            async (user) => {
                clearTimeout(fallback)
                if (user) {
                    try {
                        const profile = await getUserProfile(user.uid)
                        setState({ user, profile, loading: false, error: null })
                    } catch {
                        // Perfil não encontrado — trata como deslogado
                        setState({ user: null, profile: null, loading: false, error: null })
                    }
                } else {
                    setState({ user: null, profile: null, loading: false, error: null })
                }
            },
            (err) => {
                // Erro de inicialização do Firebase (config inválida, sem internet, etc.)
                clearTimeout(fallback)
                console.error('Firebase Auth error:', err)
                setState({ user: null, profile: null, loading: false, error: null })
            }
        )

        return () => {
            clearTimeout(fallback)
            unsub()
        }
    }, [])

    async function register(
        email: string,
        password: string,
        name: string,
        parentEmail: string,
        subjects: Subject[],
        difficulties: Partial<Record<Subject, DifficultyLevel>>,
    ) {
        setState(s => ({ ...s, loading: true, error: null }))
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password)
            const profile: UserProfile = {
                uid: user.uid,
                name,
                email,
                parentEmail,
                subjects,
                difficulties,
                plan: 'free',
                xp: 0,
                level: 1,
                streak: 0,
                lastStudyDate: null,
                createdAt: new Date().toISOString(),
            }
            await createUserProfile(profile)
            setState({ user, profile, loading: false, error: null })
        } catch (err: any) {
            const msg = parseFirebaseError(err.code ?? '')
            setState(s => ({ ...s, loading: false, error: msg }))
        }
    }

    async function login(email: string, password: string) {
        setState(s => ({ ...s, loading: true, error: null }))
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password)
            const profile = await getUserProfile(user.uid)
            setState({ user, profile, loading: false, error: null })
        } catch (err: any) {
            const msg = parseFirebaseError(err.code ?? '')
            setState(s => ({ ...s, loading: false, error: msg }))
        }
    }

    async function logout() {
        await signOut(auth)
        setState({ user: null, profile: null, loading: false, error: null })
    }

    function refreshProfile() {
        if (!state.user) return
        getUserProfile(state.user.uid).then(profile => {
            setState(s => ({ ...s, profile }))
        })
    }

    return { ...state, register, login, logout, refreshProfile }
}
