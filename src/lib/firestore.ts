// Helpers para leitura/escrita no Firestore
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    collection,
    query,
    orderBy,
    getDocs,
    increment,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
    UserProfile,
    Conversation,
    ChatMessage,
    Flashcard,
    Badge,
    StudySession,
    BadgeType,
    Subject,
} from '../types'
import { getLevelFromXP, XP_REWARDS } from '../types'

// ──────── Usuário ────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
    await setDoc(doc(db, 'users', profile.uid), profile)
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), data)
}

// ──────── XP e Nível ────────

export async function addXP(uid: string, amount: number): Promise<void> {
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) return
    const profile = snap.data() as UserProfile
    const newXP = profile.xp + amount
    const newLevel = getLevelFromXP(newXP)
    await updateDoc(userRef, { xp: newXP, level: newLevel })
}

// ──────── Streak ────────

export async function updateStreak(uid: string): Promise<number> {
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) return 0
    const profile = snap.data() as UserProfile
    const today = new Date().toISOString().split('T')[0]
    const lastDate = profile.lastStudyDate

    let newStreak = profile.streak
    if (lastDate === today) return newStreak  // já contou hoje

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
        newStreak += 1
    } else {
        newStreak = 1  // streak quebrado
    }

    await updateDoc(userRef, {
        streak: newStreak,
        lastStudyDate: today,
        xp: increment(XP_REWARDS.daily_login + newStreak * XP_REWARDS.streak_bonus),
    })
    return newStreak
}

// ──────── Conversas ────────

export async function createConversation(uid: string, subject: Subject, topic: string): Promise<string> {
    const ref = await addDoc(collection(db, 'users', uid, 'conversations'), {
        subject,
        topic,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    })
    return ref.id
}

export async function saveMessage(uid: string, convId: string, message: ChatMessage): Promise<void> {
    const convRef = doc(db, 'users', uid, 'conversations', convId)
    const snap = await getDoc(convRef)
    if (!snap.exists()) return
    const conv = snap.data() as Conversation
    await updateDoc(convRef, {
        messages: [...conv.messages, message],
        updatedAt: new Date().toISOString(),
    })
}

export async function getConversations(uid: string): Promise<Conversation[]> {
    const q = query(
        collection(db, 'users', uid, 'conversations'),
        orderBy('updatedAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation))
}

// ──────── Flashcards ────────

export async function saveFlashcards(uid: string, cards: Omit<Flashcard, 'id'>[]): Promise<void> {
    const batch = cards.map(card =>
        addDoc(collection(db, 'users', uid, 'flashcards'), card)
    )
    await Promise.all(batch)
}

export async function getFlashcardsBySubject(uid: string, subject: Subject): Promise<Flashcard[]> {
    const q = query(collection(db, 'users', uid, 'flashcards'))
    const snap = await getDocs(q)
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Flashcard))
        .filter(c => c.subject === subject)
}

export async function incrementFlashcardError(uid: string, cardId: string): Promise<number> {
    const ref = doc(db, 'users', uid, 'flashcards', cardId)
    await updateDoc(ref, { errorCount: increment(1) })
    const snap = await getDoc(ref)
    return (snap.data() as Flashcard).errorCount
}

// ──────── Badges ────────

export async function awardBadge(uid: string, type: BadgeType): Promise<void> {
    const ref = doc(db, 'users', uid, 'badges', type)
    const snap = await getDoc(ref)
    if (snap.exists()) return  // já tem
    await setDoc(ref, { id: type, earnedAt: new Date().toISOString() })
}

export async function getBadges(uid: string): Promise<Badge[]> {
    const snap = await getDocs(collection(db, 'users', uid, 'badges'))
    return snap.docs.map(d => d.data() as Badge)
}

// ──────── Sessões de Estudo ────────

export async function saveStudySession(uid: string, session: Omit<StudySession, 'id'>): Promise<void> {
    await addDoc(collection(db, 'users', uid, 'studySessions'), session)
}

export async function getStudySessions(uid: string): Promise<StudySession[]> {
    const q = query(
        collection(db, 'users', uid, 'studySessions'),
        orderBy('date', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudySession))
}
