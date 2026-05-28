import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { AppShell } from './components/layout/AppShell'
import { Onboarding } from './pages/Onboarding'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Chat } from './pages/Chat'
import { Flashcards } from './pages/Flashcards'
import { Progress } from './pages/Progress'
import { getBadges, updateStreak } from './lib/firestore'
import { theme } from './themes'

function AppContent() {
    const { profile, loading, logout } = useAuth()
    const [badges, setBadges] = useState<string[]>([])

    useEffect(() => {
        if (profile?.uid) {
            getBadges(profile.uid).then(b => setBadges(b.map(x => x.id)))
            updateStreak(profile.uid)
        }
    }, [profile?.uid])

    // Exibe spinner APENAS se ainda não há perfil em cache E o Firebase ainda não respondeu
    if (loading && !profile) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: theme.bgPrimary }}
            >
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full animate-bounce"
                            style={{ backgroundColor: theme.accentLight, animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        )
    }

    // Sem perfil (não autenticado ou sessão expirada confirmada pelo Firebase)
    if (!profile) {
        return (
            <Routes>
                <Route path="/" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        )
    }

    // Perfil disponível (cache ou Firebase confirmado) — abre o app imediatamente
    return (
        <AppShell profile={profile} onLogout={logout}>
            <Routes>
                <Route path="/" element={<Home profile={profile} badges={badges} />} />
                <Route path="/chat" element={<Chat profile={profile} />} />
                <Route path="/flashcards" element={<Flashcards profile={profile} />} />
                <Route path="/progress" element={<Progress profile={profile} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppShell>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    )
}
