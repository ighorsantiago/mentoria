import { useEffect, useState } from 'react'
import { BarChart2, Award, Zap, Flame, Clock } from 'lucide-react'
import { theme } from '../themes'
import { getBadges, getStudySessions } from '../lib/firestore'
import type { UserProfile, Badge, StudySession } from '../types'
import { BADGE_METADATA, SUBJECT_LABELS, getXPForNextLevel } from '../types'

interface ProgressPageProps {
    profile: UserProfile
}

export function Progress({ profile }: ProgressPageProps) {
    const [badges, setBadges] = useState<Badge[]>([])
    const [sessions, setSessions] = useState<StudySession[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [b, s] = await Promise.all([
                getBadges(profile.uid),
                getStudySessions(profile.uid),
            ])
            setBadges(b)
            setSessions(s)
            setLoading(false)
        }
        load()
    }, [])

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0)
    const avgScore = sessions.filter(s => s.quizScore !== null).length > 0
        ? Math.round(sessions.filter(s => s.quizScore !== null).reduce((acc, s) => acc + (s.quizScore ?? 0), 0) / sessions.filter(s => s.quizScore !== null).length)
        : null

    const { current, needed, progress } = getXPForNextLevel(profile.xp)

    const stats = [
        { icon: Zap, label: 'XP Total', value: profile.xp.toString(), color: theme.xp },
        { icon: Flame, label: 'Streak', value: `${profile.streak} dias`, color: theme.streak },
        { icon: Clock, label: 'Tempo estudado', value: `${totalMinutes}min`, color: theme.accentLight },
        { icon: BarChart2, label: 'Média nos quizzes', value: avgScore !== null ? `${avgScore}%` : '—', color: theme.success },
    ]

    return (
        <div className="flex flex-col gap-8 px-8 py-10 max-w-2xl mx-auto w-full">
            <h1 className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                Progresso 📊
            </h1>

            {/* XP e Nível */}
            <div
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
            >
                <div className="flex items-center justify-between">
                    <p className="font-bold" style={{ color: theme.textPrimary }}>
                        Nível {profile.level}
                    </p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                        {current} / {needed} XP para o próximo
                    </p>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgInput }}>
                    <div
                        className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${progress}%`, backgroundColor: theme.xp, minWidth: progress > 10 ? undefined : 0 }}
                    >
                        {progress > 15 && (
                            <span className="text-xs font-bold text-black">{Math.round(progress)}%</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                {stats.map(({ icon: Icon, label, value, color }) => (
                    <div
                        key={label}
                        className="rounded-2xl p-4 flex flex-col gap-2"
                        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                    >
                        <Icon size={18} style={{ color }} />
                        <p className="text-xl font-extrabold" style={{ color: theme.textPrimary }}>
                            {value}
                        </p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Conquistas */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Award size={18} style={{ color: theme.xp }} />
                    <h2 className="font-bold" style={{ color: theme.textPrimary }}>
                        Conquistas ({badges.length})
                    </h2>
                </div>
                {loading ? (
                    <p className="text-sm" style={{ color: theme.textMuted }}>Carregando...</p>
                ) : badges.length === 0 ? (
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                        Nenhuma conquista ainda. Continue estudando!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {badges.map(badge => {
                            const meta = BADGE_METADATA[badge.id]
                            if (!meta) return null
                            return (
                                <div
                                    key={badge.id}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                                >
                                    <span className="text-2xl">{meta.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                                            {meta.label}
                                        </p>
                                        <p className="text-xs" style={{ color: theme.textMuted }}>
                                            {meta.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Sessões recentes */}
            {sessions.length > 0 && (
                <div>
                    <h2 className="font-bold mb-4" style={{ color: theme.textPrimary }}>
                        Histórico recente
                    </h2>
                    <div className="flex flex-col gap-2">
                        {sessions.slice(0, 7).map(session => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between px-4 py-3 rounded-xl"
                                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: theme.accent }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                                            {SUBJECT_LABELS[session.subject]}
                                        </p>
                                        <p className="text-xs" style={{ color: theme.textMuted }}>
                                            {session.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs" style={{ color: theme.textMuted }}>
                                    {session.quizScore !== null && (
                                        <span style={{ color: session.quizScore >= 70 ? theme.success : theme.danger }}>
                                            {session.quizScore}%
                                        </span>
                                    )}
                                    <span>+{session.xpEarned} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
