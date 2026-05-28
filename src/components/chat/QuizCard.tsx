import { useState } from 'react'
import { CheckCircle, XCircle, Trophy } from 'lucide-react'
import { theme } from '../../themes'
import type { QuizData } from '../../types'

interface QuizCardProps {
    quiz: QuizData
    onAnswer: (questionIndex: number, answerIndex: number) => Promise<boolean>
}

export function QuizCard({ quiz, onAnswer }: QuizCardProps) {
    const [currentQ, setCurrentQ] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [answered, setAnswered] = useState(false)

    const question = quiz.questions[currentQ]

    async function handleAnswer(optionIndex: number) {
        if (answered) return
        setSelected(optionIndex)
        setAnswered(true)
        const correct = await onAnswer(currentQ, optionIndex)
        setIsCorrect(correct)
    }

    function handleNext() {
        setCurrentQ(q => q + 1)
        setSelected(null)
        setIsCorrect(null)
        setAnswered(false)
    }

    // Resultado final
    if (quiz.completed && quiz.score !== undefined) {
        const score = quiz.score
        const emoji = score === 100 ? '🏆' : score >= 70 ? '👍' : '💪'
        return (
            <div
                className="rounded-2xl p-6 flex flex-col items-center gap-4 text-center"
                style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.borderAccent}` }}
            >
                <Trophy size={40} style={{ color: theme.xp }} />
                <p className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                    {emoji} {score}%
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                    {score === 100
                        ? 'Perfeito! Você dominou esse tema.'
                        : score >= 70
                        ? 'Bom trabalho! Continue praticando.'
                        : 'Vamos revisar um pouco mais esse conteúdo?'}
                </p>
            </div>
        )
    }

    if (!question) return null

    return (
        <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.borderAccent}` }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.accentLight }}>
                    Quiz
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                    {currentQ + 1} / {quiz.questions.length}
                </span>
            </div>

            {/* Pergunta */}
            <p className="font-semibold text-sm leading-relaxed" style={{ color: theme.textPrimary }}>
                {question.question}
            </p>

            {/* Opções */}
            <div className="flex flex-col gap-2">
                {question.options.map((option, i) => {
                    let bgColor = theme.bgInput
                    let borderColor = theme.border
                    let textColor = theme.textPrimary

                    if (answered) {
                        if (i === question.correctIndex) {
                            bgColor = 'rgba(16,185,129,0.15)'
                            borderColor = theme.success
                            textColor = theme.success
                        } else if (i === selected && !isCorrect) {
                            bgColor = 'rgba(239,68,68,0.15)'
                            borderColor = theme.danger
                            textColor = theme.danger
                        }
                    } else if (selected === i) {
                        bgColor = theme.accentGlow
                        borderColor = theme.accent
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={answered}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                            style={{
                                backgroundColor: bgColor,
                                border: `1px solid ${borderColor}`,
                                color: textColor,
                                cursor: answered ? 'default' : 'pointer',
                            }}
                        >
                            <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ backgroundColor: borderColor + '33', color: textColor }}
                            >
                                {String.fromCharCode(65 + i)}
                            </span>
                            {option}
                        </button>
                    )
                })}
            </div>

            {/* Feedback */}
            {answered && (
                <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                        backgroundColor: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isCorrect ? theme.success : theme.danger}`,
                        color: isCorrect ? theme.success : theme.danger,
                    }}
                >
                    <div className="flex items-center gap-2 font-semibold mb-1">
                        {isCorrect
                            ? <><CheckCircle size={14} /> Correto! 🎉</>
                            : <><XCircle size={14} /> Não foi dessa vez.</>
                        }
                    </div>
                    <p style={{ color: theme.textSecondary }}>{question.explanation}</p>
                </div>
            )}

            {/* Próxima pergunta */}
            {answered && currentQ < quiz.questions.length - 1 && (
                <button
                    onClick={handleNext}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                >
                    Próxima pergunta →
                </button>
            )}
        </div>
    )
}
