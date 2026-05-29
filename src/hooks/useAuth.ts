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

// Cache do perfil no localStorage para carregamento instantâneo
const CACHE_KEY = 'mentoria:profile_cache'

function saveCache(profile: UserProfile) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(profile)) } catch {}
}
function loadCache(): UserProfile | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        return raw ? (JSON.parse(raw) as UserProfile) : null
    } catch { return null }
}
function clearCache() {
    try { localStorage.removeItem(CACHE_KEY) } catch {}
}

// Traduz código de erro do Firebase para mensagem amigável
function parseFirebaseError(code: string): string {
    const map: Record<string, string> = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
        // Firebase SDK v10+ unifica user-not-found + wrong-password em invalid-credential
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'E-mail não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        'auth/configuration-not-found': 'Firebase não configurado. Verifique as variáveis de ambiente.',
        'auth/api-key-not-valid': 'Chave do Firebase inválida. Verifique o .env.',
        'auth/invalid-api-key': 'Chave do Firebase inválida. Verifique o .env.',
    }
    return map[code] ?? 'E-mail ou senha incorretos.'
}

interface AuthState {
    user: User | null
    profile: UserProfile | null
    loading: boolean  // true enquanto Firebase não confirmou a sessão
    error: string | null
}

export function useAuth() {
    // Carrega cache imediatamente — se existir, app abre na hora sem spinner
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: loadCache(),
        loading: true,
        error: null,
    })

    useEffect(() => {
        // Fallback reduzido: se Firebase não responder em 2.5s, libera a tela de login
        const fallback = setTimeout(() => {
            setState(s => s.loading ? { ...s, loading: false } : s)
        }, 2500)

        const unsub = onAuthStateChanged(
            auth,
            async (user) => {
                clearTimeout(fallback)
                if (user) {
                    try {
                        const profile = await getUserProfile(user.uid)
                        if (profile) saveCache(profile)
                        setState({ user, profile, loading: false, error: null })
                    } catch {
                        // Perfil não encontrado — trata como deslogado
                        clearCache()
                        setState({ user: null, profile: null, loading: false, error: null })
                    }
                } else {
                    // Firebase confirmou que não há sessão ativa
                    clearCache()
                    setState({ user: null, profile: null, loading: false, error: null })
                }
            },
            (err) => {
                clearTimeout(fallback)
                console.error('Firebase Auth error:', err)
                setState(s => ({ ...s, loading: false }))
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

            // Envia e-mail de boas-vindas aos responsáveis (não bloqueia o fluxo)
            if (parentEmail) {
                fetch('/api/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'welcome', parentEmail, studentName: name }),
                }).catch(() => {}) // silencioso — e-mail não é crítico
            }

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
        clearCache()
        await signOut(auth)
        setState({ user: null, profile: null, loading: false, error: null })
    }

    function refreshProfile() {
        if (!state.user) return
        getUserProfile(state.user.uid).then(profile => {
            if (profile) saveCache(profile)
            setState(s => ({ ...s, profile }))
        })
    }

    return { ...state, register, login, logout, refreshProfile }
}
