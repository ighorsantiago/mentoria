import { Bot, User } from 'lucide-react'
import { theme } from '../../themes'
import type { ChatMessage } from '../../types'
import { QuizCard } from './QuizCard'
import type { QuizData } from '../../types'

interface MessageBubbleProps {
    message: ChatMessage
    onQuizAnswer?: (questionIndex: number, answerIndex: number) => Promise<boolean>
    quizData?: QuizData | null
}

export function MessageBubble({ message, onQuizAnswer, quizData }: MessageBubbleProps) {
    const isUser = message.role === 'user'

    if (message.type === 'quiz' && message.quiz && onQuizAnswer) {
        return (
            <div className="w-full">
                <QuizCard
                    quiz={quizData ?? message.quiz}
                    onAnswer={onQuizAnswer}
                />
            </div>
        )
    }

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                style={{
                    backgroundColor: isUser ? theme.accentGlow : theme.bgCard,
                    border: `1px solid ${isUser ? theme.borderAccent : theme.border}`,
                }}
            >
                {isUser
                    ? <User size={14} style={{ color: theme.accentLight }} />
                    : <Bot size={14} style={{ color: theme.accentLight }} />
                }
            </div>

            {/* Balão */}
            <div
                className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                    backgroundColor: isUser ? theme.accent : theme.bgCard,
                    color: isUser ? '#fff' : theme.textPrimary,
                    borderBottomRightRadius: isUser ? 4 : undefined,
                    borderBottomLeftRadius: isUser ? undefined : 4,
                    border: isUser ? 'none' : `1px solid ${theme.border}`,
                }}
            >
                {message.content}
            </div>
        </div>
    )
}
