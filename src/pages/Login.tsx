import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { theme } from '../themes'
import { useAuth } from '../hooks/useAuth'

export function Login() {
    const { login, loading, error } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        await login(email, password)
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: theme.bgPrimary }}
        >
            <div className="w-full max-w-sm flex flex-col gap-8">
                {/* Logo */}
                <div className="text-center flex flex-col items-center gap-3">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: theme.accentGlow }}
                    >
                        <GraduationCap size={28} style={{ color: theme.accentLight }} />
                    </div>
                    <span className="text-3xl font-extrabold" style={{ color: theme.accentLight }}>
                        Mentor<span style={{ color: theme.textPrimary }}>IA</span>
                    </span>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleLogin}
                    className="rounded-3xl p-8 flex flex-col gap-4"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                        Bem-vindo de volta!
                    </h2>

                    <input
                        type="email"
                        placeholder="Seu e-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                            backgroundColor: theme.bgInput,
                            border: `1px solid ${theme.border}`,
                            color: theme.textPrimary,
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                            backgroundColor: theme.bgInput,
                            border: `1px solid ${theme.border}`,
                            color: theme.textPrimary,
                        }}
                        required
                    />

                    {error && (
                        <p className="text-xs text-center" style={{ color: theme.danger }}>
                            E-mail ou senha incorretos.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl font-bold transition-all cursor-pointer disabled:opacity-40"
                        style={{ backgroundColor: theme.accent, color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-center text-sm" style={{ color: theme.textMuted }}>
                    Não tem conta?{' '}
                    <a href="/" style={{ color: theme.accentLight }} className="hover:underline">
                        Criar conta
                    </a>
                </p>
            </div>
        </div>
    )
}
