import { useState } from 'react'
import { GraduationCap, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { theme } from '../themes'
import { useAuth } from '../hooks/useAuth'
import type { Subject, DifficultyLevel } from '../types'
import { SUBJECT_LABELS, DIFFICULTY_LABELS } from '../types'

type Step = 'welcome' | 'name' | 'subjects' | 'difficulty' | 'parent' | 'password'

const ALL_SUBJECTS: Subject[] = [
    'matematica', 'portugues', 'redacao',
    'fisica', 'quimica', 'biologia', 'ciencias',
    'historia', 'geografia',
    'ingles', 'espanhol',
    'artes', 'educacao_fisica', 'filosofia', 'sociologia',
]

const STEPS: Step[] = ['welcome', 'name', 'subjects', 'difficulty', 'parent', 'password']

export function Onboarding() {
    const { register, loading, error } = useAuth()
    const [step, setStep] = useState<Step>('welcome')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [parentEmail, setParentEmail] = useState('')
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [difficulties, setDifficulties] = useState<Partial<Record<Subject, DifficultyLevel>>>({})
    const [parentEmailError, setParentEmailError] = useState('')

    const currentIndex = STEPS.indexOf(step)
    const progress = (currentIndex / (STEPS.length - 1)) * 100

    function toggleSubject(s: Subject) {
        setSubjects(prev =>
            prev.includes(s)
                ? prev.filter(x => x !== s)
                : [...prev, s]
        )
    }

    function setSubjectDifficulty(s: Subject, d: DifficultyLevel) {
        setDifficulties(prev => ({ ...prev, [s]: d }))
    }

    function validateParentEmail(): boolean {
        if (parentEmail && parentEmail === email) {
            setParentEmailError('O e-mail dos responsáveis não pode ser o mesmo do aluno.')
            return false
        }
        if (parentEmail && !parentEmail.includes('@')) {
            setParentEmailError('E-mail inválido.')
            return false
        }
        setParentEmailError('')
        return true
    }

    async function handleFinish() {
        await register(email, password, name, parentEmail, subjects, difficulties)
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-8 py-12 md:px-16"
            style={{ backgroundColor: theme.bgPrimary }}
        >
            <div className="w-full max-w-lg flex flex-col gap-6">

                {/* Logo */}
                <div className="text-center">
                    <span className="text-3xl font-extrabold" style={{ color: theme.accentLight }}>
                        Mentor<span style={{ color: theme.textPrimary }}>IA</span>
                    </span>
                </div>

                {/* Progress bar */}
                {step !== 'welcome' && (
                    <div className="h-1.5 rounded-full overflow-hidden mx-2" style={{ backgroundColor: theme.bgCard }}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: theme.accent }}
                        />
                    </div>
                )}

                {/* Card */}
                <div
                    className="rounded-3xl p-8 flex flex-col gap-6"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >

                    {/* ── Step: Boas-vindas ── */}
                    {step === 'welcome' && (
                        <>
                            <div className="flex flex-col items-center gap-4 text-center py-2">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: theme.accentGlow }}
                                >
                                    <GraduationCap size={32} style={{ color: theme.accentLight }} />
                                </div>
                                <h1 className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                                    Bem-vindo ao MentorIA!
                                </h1>
                                <p className="text-sm leading-relaxed max-w-sm" style={{ color: theme.textSecondary }}>
                                    Seu tutor inteligente para te ajudar a estudar de forma mais eficiente e divertida.
                                    Vamos configurar seu perfil em menos de 2 minutos.
                                </p>
                            </div>
                            <button
                                onClick={() => setStep('name')}
                                className="w-full py-4 rounded-2xl font-bold transition-all cursor-pointer"
                                style={{ backgroundColor: theme.accent, color: '#fff' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                            >
                                Vamos começar! →
                            </button>
                        </>
                    )}

                    {/* ── Step: Nome e email ── */}
                    {step === 'name' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    Como você se chama?
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Assim o MentorIA pode te chamar pelo nome!
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        backgroundColor: theme.bgInput,
                                        border: `1px solid ${theme.border}`,
                                        color: theme.textPrimary,
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Seu e-mail"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        backgroundColor: theme.bgInput,
                                        border: `1px solid ${theme.border}`,
                                        color: theme.textPrimary,
                                    }}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('welcome')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    disabled={!name.trim() || !email.includes('@')}
                                    onClick={() => setStep('subjects')}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer disabled:opacity-40"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    Continuar <ChevronRight size={14} className="inline" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step: Matérias ── */}
                    {step === 'subjects' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    Quais matérias você estuda?
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Selecione as que você mais precisa de ajuda.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ALL_SUBJECTS.map(s => {
                                    const selected = subjects.includes(s)
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => toggleSubject(s)}
                                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                                            style={{
                                                backgroundColor: selected ? theme.accentGlow : theme.bgInput,
                                                border: `1px solid ${selected ? theme.accent : theme.border}`,
                                                color: selected ? theme.accentLight : theme.textSecondary,
                                            }}
                                        >
                                            {SUBJECT_LABELS[s]}
                                            {selected && <Check size={13} className="shrink-0" />}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('name')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    disabled={subjects.length === 0}
                                    onClick={() => setStep('difficulty')}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer disabled:opacity-40"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    Continuar <ChevronRight size={14} className="inline" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step: Dificuldade por matéria ── */}
                    {step === 'difficulty' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    Seu nível em cada matéria
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Isso ajuda o MentorIA a calibrar as explicações para você.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
                                {subjects.map(s => {
                                    const current = difficulties[s] ?? 3
                                    return (
                                        <div key={s}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                                                    {SUBJECT_LABELS[s]}
                                                </span>
                                                <span className="text-xs" style={{ color: theme.textMuted }}>
                                                    {DIFFICULTY_LABELS[current]}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {([1, 2, 3, 4, 5] as DifficultyLevel[]).map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => setSubjectDifficulty(s, d)}
                                                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                                        style={{
                                                            backgroundColor: current === d ? theme.accent : theme.bgInput,
                                                            color: current === d ? '#fff' : theme.textMuted,
                                                            border: `1px solid ${current === d ? theme.accent : theme.border}`,
                                                        }}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('subjects')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    onClick={() => setStep('parent')}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    Continuar <ChevronRight size={14} className="inline" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step: Email dos responsáveis ── */}
                    {step === 'parent' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    E-mail dos responsáveis
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Enviaremos um relatório semanal de progresso. Pode pular se preferir.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="email"
                                    placeholder="email.responsavel@exemplo.com"
                                    value={parentEmail}
                                    onChange={e => {
                                        setParentEmail(e.target.value)
                                        setParentEmailError('')
                                    }}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        backgroundColor: theme.bgInput,
                                        border: `1px solid ${parentEmailError ? theme.danger : theme.border}`,
                                        color: theme.textPrimary,
                                    }}
                                />
                                {parentEmailError && (
                                    <p className="text-xs px-1" style={{ color: theme.danger }}>
                                        {parentEmailError}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('difficulty')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    onClick={() => {
                                        if (parentEmail && !validateParentEmail()) return
                                        setStep('password')
                                    }}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    {parentEmail ? 'Continuar' : 'Pular'} <ChevronRight size={14} className="inline" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step: Senha ── */}
                    {step === 'password' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    Crie sua senha
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Mínimo 6 caracteres.
                                </p>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && password.length >= 6 && !loading && handleFinish()}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    backgroundColor: theme.bgInput,
                                    border: `1px solid ${error ? theme.danger : theme.border}`,
                                    color: theme.textPrimary,
                                }}
                            />
                            {error && (
                                <p className="text-xs text-center" style={{ color: theme.danger }}>
                                    {error}
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('parent')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    disabled={password.length < 6 || loading}
                                    onClick={handleFinish}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer disabled:opacity-40"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    {loading ? 'Criando conta...' : 'Entrar! 🚀'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Link login */}
                {(step === 'welcome' || step === 'name') && (
                    <p className="text-center text-sm" style={{ color: theme.textMuted }}>
                        Já tem conta?{' '}
                        <a href="/login" style={{ color: theme.accentLight }} className="hover:underline">
                            Entrar
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}
