import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { theme } from '../../themes'
import type { Flashcard } from '../../types'
import { SUBJECT_LABELS } from '../../types'

interface FlashCardProps {
    card: Flashcard
    flipped: boolean
    onFlip: () => void
    onCorrect: () => void
    onWrong: () => void
}

export function FlashCard({ card, flipped, onFlip, onCorrect, onWrong }: FlashCardProps) {
    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            {/* Carta */}
            <div
                className="w-full rounded-2xl p-8 min-h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none"
                onClick={onFlip}
                style={{
                    backgroundColor: flipped ? theme.bgCardHover : theme.bgCard,
                    border: `2px solid ${flipped ? theme.accentLight : theme.border}`,
                }}
            >
                <span
                    className="text-xs font-semibold uppercase tracking-widest mb-6"
                    style={{ color: theme.accentLight }}
                >
                    {flipped ? 'Resposta' : 'Pergunta'} · {SUBJECT_LABELS[card.subject]}
                </span>

                <p className="text-lg font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>
                    {flipped ? card.answer : card.question}
                </p>

                {!flipped && (
                    <div className="flex items-center gap-2 mt-6" style={{ color: theme.textMuted }}>
                        <RotateCcw size={14} />
                        <span className="text-xs">Toque para revelar</span>
                    </div>
                )}
            </div>

            {/* Botões de resposta (só aparecem após virar) */}
            {flipped && (
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onWrong}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                        style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: `1px solid ${theme.danger}`, color: theme.danger }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)')}
                    >
                        <XCircle size={18} />
                        Errei
                    </button>
                    <button
                        onClick={onCorrect}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                        style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: `1px solid ${theme.success}`, color: theme.success }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.15)')}
                    >
                        <CheckCircle size={18} />
                        Acertei
                    </button>
                </div>
            )}
        </div>
    )
}
