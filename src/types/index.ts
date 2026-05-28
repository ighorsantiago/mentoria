// Tipos centrais — MentorIA

export type Subject =
    | 'matematica'
    | 'portugues'
    | 'fisica'
    | 'quimica'
    | 'biologia'
    | 'historia'
    | 'geografia'
    | 'ingles'

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

export type Plan = 'free' | 'premium'

export type BadgeType =
    | 'first_quiz'
    | 'quiz_master'
    | 'streak_3'
    | 'streak_7'
    | 'streak_30'
    | 'subject_master'
    | 'flashcard_100'
    | 'perfect_quiz'

// ──────────────────────────────────────────────
// Firestore: users/{uid}
// ──────────────────────────────────────────────
export interface UserProfile {
    uid: string
    name: string
    email: string
    parentEmail: string
    subjects: Subject[]
    difficulty: DifficultyLevel
    plan: Plan
    xp: number
    level: number
    streak: number
    lastStudyDate: string | null  // ISO date string
    createdAt: string
}

// ──────────────────────────────────────────────
// Firestore: users/{uid}/conversations/{convId}
// ──────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant'
export type MessageType = 'text' | 'quiz' | 'explanation'

export interface ChatMessage {
    id: string
    role: MessageRole
    content: string
    type: MessageType
    timestamp: string
    quiz?: QuizData
}

export interface Conversation {
    id: string
    subject: Subject
    topic: string
    messages: ChatMessage[]
    createdAt: string
    updatedAt: string
}

// ──────────────────────────────────────────────
// Quiz
// ──────────────────────────────────────────────
export interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
}

export interface QuizData {
    questions: QuizQuestion[]
    userAnswers?: number[]
    score?: number
    completed?: boolean
}

// ──────────────────────────────────────────────
// Firestore: users/{uid}/flashcards/{cardId}
// ──────────────────────────────────────────────
export interface Flashcard {
    id: string
    subject: Subject
    topic: string
    question: string
    answer: string
    errorCount: number
    lastSeen: string | null
    createdAt: string
}

export interface FlashcardDeck {
    subject: Subject
    topic: string
    cards: Flashcard[]
    createdAt: string
}

// ──────────────────────────────────────────────
// Firestore: users/{uid}/badges/{badgeId}
// ──────────────────────────────────────────────
export interface Badge {
    id: BadgeType
    earnedAt: string
}

// ──────────────────────────────────────────────
// Firestore: users/{uid}/studySessions/{sessionId}
// ──────────────────────────────────────────────
export interface StudySession {
    id: string
    date: string              // YYYY-MM-DD
    durationMin: number
    subject: Subject
    quizScore: number | null  // 0-100
    flashcardsReviewed: number
    xpEarned: number
}

// ──────────────────────────────────────────────
// XP / Gamificação
// ──────────────────────────────────────────────
export const XP_REWARDS = {
    message_sent: 2,
    quiz_completed: 15,
    quiz_perfect: 30,
    flashcard_correct: 5,
    flashcard_wrong: 1,    // mesmo errando ganha XP (esforço)
    daily_login: 10,
    streak_bonus: 5,       // por dia de streak
} as const

export const LEVEL_THRESHOLDS = [
    0,     // nível 1
    100,   // nível 2
    250,   // nível 3
    500,   // nível 4
    900,   // nível 5
    1400,  // nível 6
    2000,  // nível 7
    2700,  // nível 8
    3500,  // nível 9
    5000,  // nível 10
] as const

export function getLevelFromXP(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
    }
    return 1
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
    const level = getLevelFromXP(xp)
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
    const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
    const needed = nextThreshold - currentThreshold
    const current = xp - currentThreshold
    return { current, needed, progress: Math.min((current / needed) * 100, 100) }
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
export const SUBJECT_LABELS: Record<Subject, string> = {
    matematica: 'Matemática',
    portugues: 'Português',
    fisica: 'Física',
    quimica: 'Química',
    biologia: 'Biologia',
    historia: 'História',
    geografia: 'Geografia',
    ingles: 'Inglês',
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    1: 'Fácil',
    2: 'Razoável',
    3: 'Médio',
    4: 'Difícil',
    5: 'Muito difícil',
}

export const BADGE_METADATA: Record<BadgeType, { label: string; description: string; icon: string }> = {
    first_quiz: { label: 'Primeiro Quiz', description: 'Completou seu primeiro quiz!', icon: '🎯' },
    quiz_master: { label: 'Mestre dos Quizzes', description: 'Completou 10 quizzes', icon: '🏆' },
    streak_3: { label: 'Em Chamas', description: '3 dias seguidos estudando', icon: '🔥' },
    streak_7: { label: 'Semana Perfeita', description: '7 dias seguidos estudando', icon: '⚡' },
    streak_30: { label: 'Mês Dedicado', description: '30 dias seguidos estudando', icon: '💎' },
    subject_master: { label: 'Especialista', description: 'Dominou uma matéria', icon: '⭐' },
    flashcard_100: { label: 'Flashcard Expert', description: 'Revisou 100 flashcards', icon: '🃏' },
    perfect_quiz: { label: 'Gabarito!', description: 'Acertou 100% de um quiz', icon: '🎖️' },
}
