import { useState, useEffect } from 'react'
import { Sparkles, RefreshCcw, Trophy, AlertCircle } from 'lucide-react'
import { theme } from '../themes'
import { useFlashcards } from '../hooks/useFlashcards'
import { FlashCard } from '../components/flashcards/FlashCard'
import type { UserProfile, Subject } from '../types'
import { SUBJECT_LABELS } from '../types'

interface FlashcardsPageProps {
    profile: UserProfile
}

export function Flashcards({ profile }: FlashcardsPageProps) {
    const [selectedSubject, setSelectedSubject] = useState<Subject>(
        profile.subjects[0] ?? 'matematica'
    )
    const [topic, setTopic] = useState('')
    const [started, setStarted] = useState(false)

    const fc = useFlashcards({ uid: profile.uid, subject: selectedSubject })

    useEffect(() => {
        if (started) fc.loadCards()
    }, [selectedSubject, started])

    async function handleGenerate() {
        if (!topic.trim()) return
        await fc.generateDeck(topic)
        setStarted(true)
    }

    // Tela de configuração
    if (!started || (fc.cards.length === 0 && !fc.loading)) {
        return (
            <div className="flex flex-col gap-8 px-8 py-10 max-w-md mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                        Flashcards 🃏
                    </h1>
                    <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                        Gere cartões de memorização para a sua próxima prova.
                    </p>
                </div>

                <div
                    className="rounded-2xl p-6 flex flex-col gap-4"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    {/* Matéria */}
                    <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: theme.textSecondary }}>
                            Matéria
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {profile.subjects.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedSubject(s)}
                                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
                                    style={{
                                        backgroundColor: selectedSubject === s ? theme.accentGlow : theme.bgInput,
                                        border: `1px solid ${selectedSubject === s ? theme.accent : theme.border}`,
                                        color: selectedSubject === s ? theme.accentLight : theme.textSecondary,
                                    }}
                                >
                                    {SUBJECT_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tema */}
                    <div>
                        <label className="text-xs font-semibold mb-2 block" style={{ color: theme.textSecondary }}>
                            Tema da prova
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Equações do 2º grau, Segunda Guerra Mundial..."
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: theme.bgInput,
                                border: `1px solid ${theme.border}`,
                                color: theme.textPrimary,
                            }}
                        />
                    </div>

                    {fc.error && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: theme.danger }}>
                            <AlertCircle size={13} />
                            {fc.error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={!topic.trim() || fc.generating}
                        className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                        style={{ backgroundColor: theme.accent, color: '#fff' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                    >
                        <Sparkles size={16} />
                        {fc.generating ? 'Gerando flashcards...' : 'Gerar Flashcards com IA'}
                    </button>
                </div>
            </div>
        )
    }

    // Loading
    if (fc.loading || fc.generating) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full animate-bounce"
                            style={{ backgroundColor: theme.accentLight, animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                    Gerando seus flashcards...
                </p>
            </div>
        )
    }

    // Sessão concluída
    if (fc.isFinished) {
        const accuracy = fc.sessionStats.total > 0
            ? Math.round((fc.sessionStats.correct / fc.sessionStats.total) * 100)
            : 0

        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-6 text-center max-w-md mx-auto">
                <Trophy size={56} style={{ color: theme.xp }} />
                <div>
                    <h2 className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                        Sessão concluída! 🎉
                    </h2>
                    <p className="text-sm mt-2" style={{ color: theme.textSecondary }}>
                        {accuracy >= 80
                            ? 'Excelente! Você está dominando esse tema.'
                            : accuracy >= 60
                            ? 'Bom trabalho! Continue praticando.'
                            : 'Vamos revisar mais um pouco. Você vai chegar lá!'}
                    </p>
                </div>

                <div
                    className="w-full rounded-2xl p-5 flex justify-around"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    <div className="text-center">
                        <p className="text-2xl font-extrabold" style={{ color: theme.success }}>
                            {fc.sessionStats.correct}
                        </p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Acertos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-extrabold" style={{ color: theme.danger }}>
                            {fc.sessionStats.wrong}
                        </p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Erros</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-extrabold" style={{ color: theme.xp }}>
                            {accuracy}%
                        </p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>Precisão</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={fc.restart}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm cursor-pointer"
                        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, color: theme.textSecondary }}
                    >
                        <RefreshCcw size={15} />
                        Repetir
                    </button>
                    <button
                        onClick={() => { setStarted(false); setTopic('') }}
                        className="flex-1 py-4 rounded-2xl font-bold text-sm cursor-pointer"
                        style={{ backgroundColor: theme.accent, color: '#fff' }}
                    >
                        Novo tema
                    </button>
                </div>
            </div>
        )
    }

    // Flashcard + Explicação automática em caso de erro persistente
    return (
        <div className="flex flex-col gap-6 px-8 py-10 max-w-md mx-auto w-full">
            {/* Progresso */}
            <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
                <span>{fc.currentIndex + 1} / {fc.cards.length}</span>
                <div className="flex gap-3">
                    <span style={{ color: theme.success }}>✓ {fc.sessionStats.correct}</span>
                    <span style={{ color: theme.danger }}>✗ {fc.sessionStats.wrong}</span>
                </div>
            </div>

            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgCard }}>
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${(fc.currentIndex / fc.cards.length) * 100}%`,
                        backgroundColor: theme.accent,
                    }}
                />
            </div>

            {/* Explicação automática (erro persistente) */}
            {fc.autoExplanation && fc.autoExplanation !== 'carregando' && (
                <div
                    className="rounded-2xl p-5 flex flex-col gap-3"
                    style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: `1px solid ${theme.danger}` }}
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} style={{ color: theme.danger }} />
                        <p className="text-sm font-bold" style={{ color: theme.danger }}>
                            Atenção! Você errou este card mais de uma vez.
                        </p>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.textSecondary }}>
                        {fc.autoExplanation}
                    </p>
                    <button
                        onClick={fc.dismissExplanation}
                        className="self-end px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        style={{ backgroundColor: theme.bgCard, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                    >
                        Entendi, próximo card →
                    </button>
                </div>
            )}

            {fc.autoExplanation === 'carregando' && (
                <div className="flex items-center gap-3 text-sm" style={{ color: theme.textSecondary }}>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                                style={{ backgroundColor: theme.accentLight, animationDelay: `${i * 0.15}s` }} />
                        ))}
                    </div>
                    Gerando explicação...
                </div>
            )}

            {/* Carta */}
            {fc.currentCard && !fc.autoExplanation && (
                <FlashCard
                    card={fc.currentCard}
                    flipped={fc.flipped}
                    onFlip={fc.flip}
                    onCorrect={fc.markCorrect}
                    onWrong={fc.markWrong}
                />
            )}
        </div>
    )
}
