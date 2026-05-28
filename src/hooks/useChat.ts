import { useState, useRef } from 'react'
import type { ChatMessage, Subject, QuizData } from '../types'
import { saveMessage, addXP, awardBadge } from '../lib/firestore'
import { XP_REWARDS } from '../types'

interface UseChatOptions {
    uid: string
    conversationId: string
    subject: Subject
    difficulty: number
    studentName: string
}

// Quantas vezes o aluno repetiu a mesma dúvida antes de ativar o modo "simples"
const CONFUSION_THRESHOLD = 2

export function useChat({ uid, conversationId, subject, difficulty, studentName }: UseChatOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [quizData, setQuizData] = useState<QuizData | null>(null)
    const confusionCount = useRef(0)

    function buildSystemPrompt(): string {
        return `Você é o MentorIA, um tutor educacional inteligente, paciente e motivador para estudantes brasileiros do Ensino Fundamental e Médio.

Aluno: ${studentName}
Matéria foco desta conversa: ${subject}
Nível de dificuldade do aluno (1=fácil, 5=muito difícil): ${difficulty}

Diretrizes:
1. Seja sempre encorajador. Nunca faça o aluno se sentir burro.
2. Use linguagem clara, exemplos do dia a dia e analogias criativas.
3. Adapte a complexidade ao nível de dificuldade informado.
4. Quando perceber que o aluno está confuso, explique de forma ainda mais simples, usando passos menores.
5. Após explicar um conceito, sempre ofereça gerar um quiz de 3 a 5 perguntas.
6. Para gerar um quiz, retorne um JSON no formato:
   {"type":"quiz","questions":[{"id":"1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
7. Nunca retorne o JSON e texto junto. Ou é texto OU é quiz.
8. Seja breve nas respostas (máximo 4 parágrafos), a menos que o aluno precise de mais detalhes.`
    }

    async function sendMessage(content: string) {
        setLoading(true)
        setError(null)

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            type: 'text',
            timestamp: new Date().toISOString(),
        }

        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        await saveMessage(uid, conversationId, userMsg)
        await addXP(uid, XP_REWARDS.message_sent)

        // Verifica se o aluno está confuso repetidamente
        const lowerContent = content.toLowerCase()
        const confusionWords = ['não entendi', 'não entendo', 'como assim', 'ainda confuso', 'não compreendi']
        if (confusionWords.some(w => lowerContent.includes(w))) {
            confusionCount.current += 1
        }

        const shouldSimplify = confusionCount.current >= CONFUSION_THRESHOLD

        try {
            const systemPrompt = buildSystemPrompt()
            const apiMessages = updatedMessages.map(m => ({
                role: m.role,
                content: m.type === 'quiz' && m.quiz
                    ? `[Quiz gerado - ${m.quiz.questions.length} perguntas]`
                    : m.content,
            }))

            if (shouldSimplify) {
                apiMessages[apiMessages.length - 1].content =
                    `[MODO SIMPLIFICADO ATIVADO - explique como se o aluno tivesse 10 anos, use analogias do cotidiano] ${content}`
                confusionCount.current = 0
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-5',
                    max_tokens: 1500,
                    system: systemPrompt,
                    messages: apiMessages,
                }),
            })

            if (!response.ok) throw new Error('Erro na API')

            const data = await response.json()
            const rawContent: string = data.content?.[0]?.text ?? ''

            // Tenta parsear como quiz
            let assistantMsg: ChatMessage
            try {
                const parsed = JSON.parse(rawContent)
                if (parsed.type === 'quiz' && parsed.questions) {
                    assistantMsg = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: 'Quiz gerado! Vamos testar o que você aprendeu?',
                        type: 'quiz',
                        timestamp: new Date().toISOString(),
                        quiz: { questions: parsed.questions },
                    }
                    setQuizData({ questions: parsed.questions })
                } else {
                    throw new Error('not quiz')
                }
            } catch {
                assistantMsg = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: rawContent,
                    type: 'text',
                    timestamp: new Date().toISOString(),
                }
            }

            setMessages(prev => [...prev, assistantMsg])
            await saveMessage(uid, conversationId, assistantMsg)
        } catch (err: any) {
            setError('Ops! Não consegui responder. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    async function submitQuizAnswer(questionIndex: number, answerIndex: number): Promise<boolean> {
        if (!quizData) return false
        const question = quizData.questions[questionIndex]
        const isCorrect = answerIndex === question.correctIndex

        const xp = isCorrect ? XP_REWARDS.quiz_completed : 0
        if (xp > 0) await addXP(uid, xp)

        const updatedAnswers = [...(quizData.userAnswers ?? []), answerIndex]
        const isLastQuestion = questionIndex === quizData.questions.length - 1

        if (isLastQuestion) {
            const correctCount = updatedAnswers.filter(
                (ans, i) => ans === quizData.questions[i].correctIndex
            ).length
            const score = Math.round((correctCount / quizData.questions.length) * 100)
            const updatedQuiz = { ...quizData, userAnswers: updatedAnswers, score, completed: true }
            setQuizData(updatedQuiz)

            if (score === 100) {
                await addXP(uid, XP_REWARDS.quiz_perfect)
                await awardBadge(uid, 'perfect_quiz')
            }
            await awardBadge(uid, 'first_quiz')
        } else {
            setQuizData(prev => prev ? { ...prev, userAnswers: updatedAnswers } : prev)
        }

        return isCorrect
    }

    function requestQuiz() {
        sendMessage('Pode gerar um quiz sobre o que acabamos de estudar?')
    }

    return { messages, loading, error, quizData, sendMessage, submitQuizAnswer, requestQuiz }
}
