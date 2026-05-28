import { useNavigate } from 'react-router-dom'
import { MessageCircle, CreditCard, Flame, Zap, Award } from 'lucide-react'
import { theme } from '../themes'
import type { UserProfile } from '../types'
import { getXPForNextLevel, BADGE_METADATA, SUBJECT_LABELS } from '../types'

interface HomeProps {
    profile: UserProfile
    badges: string[]
}

export function Home({ profile, badges }: HomeProps) {
    const navigate = useNavigate()
    const { current, needed, progress } = getXPForNextLevel(profile.xp)

    const quickActions = [
        {
            icon: MessageCircle,
            label: 'Iniciar Tutoria',
            description: 'Tire dúvidas com seu mentor IA',
            to: '/chat',
            color: theme.accent,
        },
        {
            icon: CreditCard,
            label: 'Flashcards',
            description: 'Revise conteúdo com cartões de memória',
            to: '/flashcards',
            color: theme.success,
        },
    ]

    return (
        <div className="flex flex-col gap-8 px-8 py-10 max-w-2xl mx-auto w-full">
            {/* Saudação */}
            <div>
                <h1 className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                    Olá, {profile.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                    {profile.streak > 0
                        ? `Você está em ${profile.streak} dias seguidos de estudo. Continue assim!`
                        : 'Pronto para estudar hoje?'}
                </p>
            </div>

            {/* Card de XP/Nível */}
            <div
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold"
                            style={{ backgroundColor: theme.accentGlow, color: theme.accentLight }}
                        >
                            {profile.level}
                        </div>
                        <div>
                            <p className="font-bold" style={{ color: theme.textPrimary }}>
                                Nível {profile.level}
                            </p>
                            <p className="text-xs" style={{ color: theme.textMuted }}>
                                {profile.xp} XP total
                            </p>
                        </div>
                    </div>
                    {profile.streak > 0 && (
                        <div className="flex items-center gap-2">
                            <Flame size={18} style={{ color: theme.streak }} />
                            <span className="font-bold" style={{ color: theme.streak }}>
                                {profile.streak}
                            </span>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: theme.textMuted }}>
                        <span className="flex items-center gap-1">
                            <Zap size={10} style={{ color: theme.xp }} />
                            {current} / {needed} XP
                        </span>
                        <span>Nível {profile.level + 1}</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgInput }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, backgroundColor: theme.xp }}
                        />
                    </div>
                </div>
            </div>

            {/* Ações rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map(({ icon: Icon, label, description, to, color }) => (
                    <button
                        key={to}
                        onClick={() => navigate(to)}
                        className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all cursor-pointer"
                        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: color + '22' }}
                        >
                            <Icon size={20} style={{ color }} />
                        </div>
                        <div>
                            <p className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                                {label}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                                {description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Matérias do perfil */}
            <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
            >
                <p className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
                    Suas matérias
                </p>
                <div className="flex flex-wrap gap-2">
                    {profile.subjects.map(s => (
                        <button
                            key={s}
                            onClick={() => navigate(`/chat?subject=${s}`)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                            style={{
                                backgroundColor: theme.bgInput,
                                border: `1px solid ${theme.border}`,
                                color: theme.textSecondary,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}
                        >
                            {SUBJECT_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conquistas recentes */}
            {badges.length > 0 && (
                <div
                    className="rounded-2xl p-5 flex flex-col gap-3"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    <div className="flex items-center gap-2">
                        <Award size={16} style={{ color: theme.xp }} />
                        <p className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
                            Conquistas
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {badges.map(b => {
                            const meta = BADGE_METADATA[b as keyof typeof BADGE_METADATA]
                            if (!meta) return null
                            return (
                                <div
                                    key={b}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                                    style={{
                                        backgroundColor: theme.bgInput,
                                        border: `1px solid ${theme.border}`,
                                        color: theme.textSecondary,
                                    }}
                                    title={meta.description}
                                >
                                    <span>{meta.icon}</span>
                                    {meta.label}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
