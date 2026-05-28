import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, BookOpen, Brain } from 'lucide-react'
import { theme } from '../themes'
import { useChat } from '../hooks/useChat'
import { createConversation, updateStreak } from '../lib/firestore'
import { MessageBubble } from '../components/chat/MessageBubble'
import type { UserProfile, Subject } from '../types'
import { SUBJECT_LABELS } from '../types'

const ALL_SUBJECTS: Subject[] = [
    'matematica', 'portugues', 'redacao', 'fisica', 'quimica',
    'biologia', 'ciencias', 'historia', 'geografia', 'ingles',
    'espanhol', 'artes', 'educacao_fisica', 'filosofia', 'sociologia',
]

interface ChatPageProps {
    profile: UserProfile
}

export function Chat({ profile }: ChatPageProps) {
    const [searchParams] = useSearchParams()
    const [selectedSubject, setSelectedSubject] = useState<Subject>(
        (searchParams.get('subject') as Subject) ?? profile.subjects[0] ?? 'matematica'
    )
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [initialized, setInitialized] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function init() {
            const id = await createConversation(profile.uid, selectedSubject, 'Sessão de tutoria')
            setConversationId(id)
            await updateStreak(profile.uid)
            setInitialized(true)
        }
        init()
    }, [selectedSubject])

    const chat = useChat({
        uid: profile.uid,
        conversationId: conversationId ?? 'temp',
        subject: selectedSubject,
        difficulties: profile.difficulties,
        studentName: profile.name,
    })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat.messages, chat.loading])

    async function handleSend() {
        if (!input.trim() || chat.loading || !initialized) return
        const msg = input.trim()
        setInput('')
        await chat.sendMessage(msg)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const greeting = `Oi, ${profile.name.split(' ')[0]}! Sou seu MentorIA. O que vamos estudar em ${SUBJECT_LABELS[selectedSubject]} hoje?`

    return (
        <div className="flex flex-col h-screen md:h-full max-h-screen">

            {/* Header */}
            <div
                className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
                style={{ borderColor: theme.border }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: theme.accentGlow }}
                >
                    <Brain size={18} style={{ color: theme.accentLight }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                        MentorIA
                    </p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Tutor inteligente</p>
                </div>

                {/* Seletor de matéria */}
                <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value as Subject)}
                    className="text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                    style={{
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                        color: theme.textSecondary,
                    }}
                >
                    {ALL_SUBJECTS.map(s => (
                        <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>
                    ))}
                </select>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
                {/* Mensagem de boas-vindas */}
                <div className="flex gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                        style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                    >
                        <Brain size={14} style={{ color: theme.accentLight }} />
                    </div>
                    <div
                        className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                        style={{
                            backgroundColor: theme.bgCard,
                            color: theme.textPrimary,
                            borderBottomLeftRadius: 4,
                            border: `1px solid ${theme.border}`,
                        }}
                    >
                        {greeting}
                    </div>
                </div>

                {/* Sugestões rápidas */}
                {chat.messages.length === 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {[
                            `Explica ${SUBJECT_LABELS[selectedSubject]} pra mim`,
                            'Me dá um exercício',
                            'Quero fazer um quiz',
                        ].map(s => (
                            <button
                                key={s}
                                onClick={() => { setInput(s); }}
                                className="px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                                style={{
                                    backgroundColor: theme.bgCard,
                                    border: `1px solid ${theme.border}`,
                                    color: theme.textSecondary,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent)}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {chat.messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        onQuizAnswer={chat.submitQuizAnswer}
                        quizData={msg.type === 'quiz' ? chat.quizData : null}
                    />
                ))}

                {chat.loading && (
                    <div className="flex gap-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                        >
                            <Brain size={14} style={{ color: theme.accentLight }} />
                        </div>
                        <div
                            className="px-4 py-3 rounded-2xl"
                            style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                        >
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full animate-bounce"
                                        style={{
                                            backgroundColor: theme.accentLight,
                                            animationDelay: `${i * 0.15}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {chat.error && (
                    <p className="text-center text-xs" style={{ color: theme.danger }}>
                        {chat.error}
                    </p>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
                className="px-4 py-4 border-t shrink-0"
                style={{ borderColor: theme.border }}
            >
                {/* Botão quiz rápido */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={chat.requestQuiz}
                        disabled={chat.loading || chat.messages.length === 0}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-40"
                        style={{
                            backgroundColor: theme.bgCard,
                            border: `1px solid ${theme.border}`,
                            color: theme.textSecondary,
                        }}
                    >
                        <BookOpen size={13} />
                        Gerar quiz
                    </button>
                </div>

                <div
                    className="flex items-end gap-3 rounded-2xl px-4 py-3"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pergunte qualquer coisa..."
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
                        style={{
                            color: theme.textPrimary,
                            maxHeight: 120,
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || chat.loading}
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40"
                        style={{ backgroundColor: theme.accent }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                    >
                        <Send size={15} color="#fff" />
                    </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: theme.textMuted }}>
                    Enter para enviar · Shift+Enter para nova linha
                </p>
            </div>
        </div>
    )
}
