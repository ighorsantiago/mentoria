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
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const profile = await getUserProfile(user.uid)
                setState({ user, profile, loading: false, error: null })
            } else {
                setState({ user: null, profile: null, loading: false, error: null })
            }
        })
        return unsub
    }, [])

    async function register(
        email: string,
        password: string,
        name: string,
        parentEmail: string,
        subjects: Subject[],
        difficulty: DifficultyLevel,
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
                difficulty,
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
            setState(s => ({ ...s, loading: false, error: err.message }))
        }
    }

    async function login(email: string, password: string) {
        setState(s => ({ ...s, loading: true, error: null }))
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password)
            const profile = await getUserProfile(user.uid)
            setState({ user, profile, loading: false, error: null })
        } catch (err: any) {
            setState(s => ({ ...s, loading: false, error: err.message }))
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
