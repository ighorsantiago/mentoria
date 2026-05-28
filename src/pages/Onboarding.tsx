import { useState } from 'react'
import { GraduationCap, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { theme } from '../themes'
import { useAuth } from '../hooks/useAuth'
import type { Subject, DifficultyLevel } from '../types'
import { SUBJECT_LABELS, DIFFICULTY_LABELS } from '../types'

type Step = 'welcome' | 'name' | 'subjects' | 'difficulty' | 'parent' | 'password'

const ALL_SUBJECTS: Subject[] = ['matematica', 'portugues', 'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'ingles']

export function Onboarding() {
    const { register, loading, error } = useAuth()
    const [step, setStep] = useState<Step>('welcome')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [parentEmail, setParentEmail] = useState('')
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(3)

    const steps: Step[] = ['welcome', 'name', 'subjects', 'difficulty', 'parent', 'password']
    const currentIndex = steps.indexOf(step)
    const progress = ((currentIndex) / (steps.length - 1)) * 100

    function toggleSubject(s: Subject) {
        setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    }

    async function handleFinish() {
        await register(email, password, name, parentEmail, subjects, difficulty)
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: theme.bgPrimary }}
        >
            <div className="w-full max-w-md flex flex-col gap-8">
                {/* Logo */}
                <div className="text-center">
                    <span className="text-3xl font-extrabold" style={{ color: theme.accentLight }}>
                        Mentor<span style={{ color: theme.textPrimary }}>IA</span>
                    </span>
                </div>

                {/* Progress bar */}
                {step !== 'welcome' && (
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.bgCard }}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: theme.accent }}
                        />
                    </div>
                )}

                {/* Cards de cada step */}
                <div
                    className="rounded-3xl p-8 flex flex-col gap-6"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}` }}
                >
                    {/* Step: Boas-vindas */}
                    {step === 'welcome' && (
                        <>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: theme.accentGlow }}
                                >
                                    <GraduationCap size={32} style={{ color: theme.accentLight }} />
                                </div>
                                <h1 className="text-2xl font-extrabold" style={{ color: theme.textPrimary }}>
                                    Bem-vindo ao MentorIA!
                                </h1>
                                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
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

                    {/* Step: Nome e email */}
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
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
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
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        backgroundColor: theme.bgInput,
                                        border: `1px solid ${theme.border}`,
                                        color: theme.textPrimary,
                                    }}
                                />
                            </div>
                            <button
                                disabled={!name.trim() || !email.includes('@')}
                                onClick={() => setStep('subjects')}
                                className="w-full py-4 rounded-2xl font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ backgroundColor: theme.accent, color: '#fff' }}
                            >
                                Continuar <ChevronRight size={16} className="inline" />
                            </button>
                        </>
                    )}

                    {/* Step: Matérias */}
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
                            <div className="grid grid-cols-2 gap-2">
                                {ALL_SUBJECTS.map(s => {
                                    const selected = subjects.includes(s)
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => toggleSubject(s)}
                                            className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
                                            style={{
                                                backgroundColor: selected ? theme.accentGlow : theme.bgInput,
                                                border: `1px solid ${selected ? theme.accent : theme.border}`,
                                                color: selected ? theme.accentLight : theme.textSecondary,
                                            }}
                                        >
                                            {SUBJECT_LABELS[s]}
                                            {selected && <Check size={14} />}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('name')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    disabled={subjects.length === 0}
                                    onClick={() => setStep('difficulty')}
                                    className="flex-1 py-3 rounded-2xl font-bold transition-all cursor-pointer disabled:opacity-40"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    Continuar <ChevronRight size={14} className="inline" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step: Dificuldade */}
                    {step === 'difficulty' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    Qual seu nível de dificuldade?
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Isso ajuda o MentorIA a calibrar as explicações para você.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {([1, 2, 3, 4, 5] as DifficultyLevel[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
                                        style={{
                                            backgroundColor: difficulty === d ? theme.accentGlow : theme.bgInput,
                                            border: `1px solid ${difficulty === d ? theme.accent : theme.border}`,
                                            color: difficulty === d ? theme.accentLight : theme.textSecondary,
                                        }}
                                    >
                                        <span>{d}. {DIFFICULTY_LABELS[d]}</span>
                                        {difficulty === d && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('subjects')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary }}
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

                    {/* Step: Email dos pais */}
                    {step === 'parent' && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                                    E-mail dos seus pais
                                </h2>
                                <p className="text-sm" style={{ color: theme.textSecondary }}>
                                    Vamos enviar um relatório semanal de progresso. Pode pular se preferir.
                                </p>
                            </div>
                            <input
                                type="email"
                                placeholder="email.dos.pais@exemplo.com"
                                value={parentEmail}
                                onChange={e => setParentEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    backgroundColor: theme.bgInput,
                                    border: `1px solid ${theme.border}`,
                                    color: theme.textPrimary,
                                }}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('difficulty')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    onClick={() => setStep('password')}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    {parentEmail ? 'Continuar' : 'Pular'} <ChevronRight size={14} className="inline" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step: Senha */}
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
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                    backgroundColor: theme.bgInput,
                                    border: `1px solid ${theme.border}`,
                                    color: theme.textPrimary,
                                }}
                            />
                            {error && (
                                <p className="text-xs text-center" style={{ color: theme.danger }}>
                                    {error.includes('email-already-in-use')
                                        ? 'Este e-mail já está cadastrado.'
                                        : 'Erro ao criar conta. Tente novamente.'}
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('parent')}
                                    className="flex-1 py-3 rounded-2xl font-semibold text-sm cursor-pointer"
                                    style={{ backgroundColor: theme.bgInput, color: theme.textSecondary }}
                                >
                                    <ChevronLeft size={14} className="inline" /> Voltar
                                </button>
                                <button
                                    disabled={password.length < 6 || loading}
                                    onClick={handleFinish}
                                    className="flex-1 py-3 rounded-2xl font-bold cursor-pointer disabled:opacity-40"
                                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                                >
                                    {loading ? 'Criando...' : 'Entrar! 🚀'}
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
