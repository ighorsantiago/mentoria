import { useState } from 'react'
import type { Flashcard, Subject } from '../types'
import {
    saveFlashcards,
    getFlashcardsBySubject,
    incrementFlashcardError,
    addXP,
    awardBadge,
} from '../lib/firestore'
import { XP_REWARDS } from '../types'

// Quantos erros no mesmo card antes de gerar explicação automática
const ERROR_THRESHOLD = 2

interface UseFlashcardsOptions {
    uid: string
    subject: Subject
}

export function useFlashcards({ uid, subject }: UseFlashcardsOptions) {
    const [cards, setCards] = useState<Flashcard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [autoExplanation, setAutoExplanation] = useState<string | null>(null)
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, total: 0 })

    async function generateDeck(topic: string) {
        setGenerating(true)
        setError(null)
        try {
            const response = await fetch('/api/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 2000,
                    messages: [
                        {
                            role: 'user',
                            content: `Gere 10 flashcards de estudo sobre "${topic}" para a matéria de ${subject} do Ensino Fundamental/Médio.

Retorne APENAS um JSON válido no formato:
{"flashcards":[{"question":"...","answer":"..."}]}

As perguntas devem ser objetivas e as respostas concisas (máximo 2 frases).`,
                        },
                    ],
                }),
            })

            if (!response.ok) throw new Error('Erro ao gerar flashcards')

            const data = await response.json()
            const raw: string = data.content?.[0]?.text ?? ''
            const parsed = JSON.parse(raw)

            const newCards: Omit<Flashcard, 'id'>[] = parsed.flashcards.map((fc: any) => ({
                subject,
                topic,
                question: fc.question,
                answer: fc.answer,
                errorCount: 0,
                lastSeen: null,
                createdAt: new Date().toISOString(),
            }))

            await saveFlashcards(uid, newCards)
            await loadCards()
        } catch (err: any) {
            setError('Não foi possível gerar os flashcards. Tente novamente.')
        } finally {
            setGenerating(false)
        }
    }

    async function loadCards() {
        setLoading(true)
        try {
            const loaded = await getFlashcardsBySubject(uid, subject)
            setCards(loaded)
            setCurrentIndex(0)
            setFlipped(false)
        } catch {
            setError('Erro ao carregar flashcards.')
        } finally {
            setLoading(false)
        }
    }

    function flip() {
        setFlipped(f => !f)
    }

    async function markCorrect() {
        await addXP(uid, XP_REWARDS.flashcard_correct)
        setSessionStats(s => ({ ...s, correct: s.correct + 1, total: s.total + 1 }))
        setAutoExplanation(null)
        nextCard()

        // Badge: 100 flashcards revisados
        if ((sessionStats.total + 1) % 100 === 0) {
            await awardBadge(uid, 'flashcard_100')
        }
    }

    async function markWrong() {
        const card = cards[currentIndex]
        if (!card) return

        await addXP(uid, XP_REWARDS.flashcard_wrong)
        const newErrorCount = await incrementFlashcardError(uid, card.id)
        setSessionStats(s => ({ ...s, wrong: s.wrong + 1, total: s.total + 1 }))

        // Atualiza errorCount local
        setCards(prev => prev.map((c, i) =>
            i === currentIndex ? { ...c, errorCount: newErrorCount } : c
        ))

        if (newErrorCount >= ERROR_THRESHOLD) {
            // Gera explicação automática via Claude
            setAutoExplanation('carregando')
            await generateExplanation(card)
        } else {
            setAutoExplanation(null)
            nextCard()
        }
    }

    async function generateExplanation(card: Flashcard) {
        try {
            const response = await fetch('/api/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 600,
                    messages: [
                        {
                            role: 'user',
                            content: `O aluno errou esta questão de flashcard mais de uma vez:

Pergunta: ${card.question}
Resposta correta: ${card.answer}

Gere uma explicação didática e simples (máximo 3 parágrafos) sobre este conceito, usando uma analogia do cotidiano para ajudar a fixar. Seja encorajador.`,
                        },
                    ],
                }),
            })
            const data = await response.json()
            const explanation: string = data.content?.[0]?.text ?? ''
            setAutoExplanation(explanation)
        } catch {
            setAutoExplanation('Não foi possível gerar a explicação. Revise este tema na aba de tutoria!')
        }
    }

    function dismissExplanation() {
        setAutoExplanation(null)
        nextCard()
    }

    function nextCard() {
        setFlipped(false)
        setCurrentIndex(i => Math.min(i + 1, cards.length))
    }

    function restart() {
        setCurrentIndex(0)
        setFlipped(false)
        setAutoExplanation(null)
        setSessionStats({ correct: 0, wrong: 0, total: 0 })
    }

    const currentCard = cards[currentIndex] ?? null
    const isFinished = currentIndex >= cards.length && cards.length > 0

    return {
        cards,
        currentCard,
        currentIndex,
        flipped,
        loading,
        generating,
        error,
        autoExplanation,
        sessionStats,
        isFinished,
        generateDeck,
        loadCards,
        flip,
        markCorrect,
        markWrong,
        dismissExplanation,
        restart,
    }
}
