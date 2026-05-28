import { NavLink } from 'react-router-dom'
import { MessageCircle, CreditCard, BarChart2, LogOut, Zap, Flame } from 'lucide-react'
import { theme } from '../../themes'
import type { UserProfile } from '../../types'
import { getXPForNextLevel } from '../../types'

interface AppShellProps {
    profile: UserProfile
    onLogout: () => void
    children: React.ReactNode
}

const navItems = [
    { to: '/chat', icon: MessageCircle, label: 'Tutor' },
    { to: '/flashcards', icon: CreditCard, label: 'Flashcards' },
    { to: '/progress', icon: BarChart2, label: 'Progresso' },
]

export function AppShell({ profile, onLogout, children }: AppShellProps) {
    const { current, needed, progress } = getXPForNextLevel(profile.xp)

    return (
        <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: theme.bgPrimary }}>

            {/* Sidebar — desktop */}
            <aside
                className="hidden md:flex flex-col w-64 shrink-0 border-r p-5 gap-6"
                style={{ backgroundColor: theme.bgSidebar, borderColor: theme.border }}
            >
                {/* Logo */}
                <div className="mb-2">
                    <span className="text-2xl font-extrabold" style={{ color: theme.accentLight }}>
                        Mentor<span style={{ color: theme.textPrimary }}>IA</span>
                    </span>
                </div>

                {/* Perfil + XP */}
                <div
                    className="rounded-2xl p-4 flex flex-col gap-3"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                            style={{ backgroundColor: theme.accentGlow, color: theme.accentLight }}
                        >
                            {profile.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold truncate" style={{ color: theme.textPrimary }}>
                                {profile.name}
                            </p>
                            <p className="text-xs" style={{ color: theme.textMuted }}>
                                Nível {profile.level}
                            </p>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: theme.textSecondary }}>
                            <span className="flex items-center gap-1">
                                <Zap size={11} style={{ color: theme.xp }} />
                                {current} XP
                            </span>
                            <span>{needed} para o próximo nível</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgInput }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progress}%`, backgroundColor: theme.xp }}
                            />
                        </div>
                    </div>

                    {/* Streak */}
                    {profile.streak > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <Flame size={16} style={{ color: theme.streak }} />
                            <span style={{ color: theme.textSecondary }}>
                                <span className="font-bold" style={{ color: theme.streak }}>{profile.streak}</span> dias seguidos
                            </span>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${isActive ? 'text-white' : ''}`
                            }
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? theme.accent : 'transparent',
                                color: isActive ? '#fff' : theme.textSecondary,
                            })}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                    style={{ color: theme.textMuted }}
                    onMouseEnter={e => (e.currentTarget.style.color = theme.danger)}
                    onMouseLeave={e => (e.currentTarget.style.color = theme.textMuted)}
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 flex flex-col min-h-0 pb-16 md:pb-0">
                {children}
            </main>

            {/* Bottom nav — mobile */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 border-t z-50"
                style={{ backgroundColor: theme.bgSidebar, borderColor: theme.border }}
            >
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className="flex flex-col items-center gap-1"
                        style={({ isActive }) => ({
                            color: isActive ? theme.accentLight : theme.textMuted,
                        })}
                    >
                        <Icon size={20} />
                        <span className="text-xs">{label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={onLogout}
                    className="flex flex-col items-center gap-1"
                    style={{ color: theme.textMuted }}
                >
                    <LogOut size={20} />
                    <span className="text-xs">Sair</span>
                </button>
            </nav>
        </div>
    )
}
