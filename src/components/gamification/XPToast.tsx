import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { theme } from '../../themes'

interface XPToastProps {
    amount: number
    onDone: () => void
}

export function XPToast({ amount, onDone }: XPToastProps) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onDone, 300)
        }, 1800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            className={`fixed top-6 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-lg z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
            style={{ backgroundColor: theme.xpGlow, border: `1px solid ${theme.xp}`, color: theme.xp }}
        >
            <Zap size={16} />
            +{amount} XP
        </div>
    )
}
