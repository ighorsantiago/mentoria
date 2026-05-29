import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WeeklyReportPayload {
    parentEmail: string
    studentName: string
    studyMinutes: number
    quizAverage: number | null
    streak: number
    xpEarned: number
    weakPoints: string[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') return res.status(200).end()
    if (req.method !== 'POST') return res.status(405).end()

    const { type, parentEmail, studentName } = req.body

    if (!parentEmail || !studentName) {
        return res.status(400).json({ error: 'Dados insuficientes' })
    }

    // ── E-mail de boas-vindas ──────────────────────────────────────────────
    if (type === 'welcome') {
        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
          .card { background: white; border-radius: 16px; padding: 32px; max-width: 520px; margin: 0 auto; }
          .logo { font-size: 24px; font-weight: 900; color: #7C3AED; margin-bottom: 24px; }
          .logo span { color: #18181B; }
          h2 { color: #18181B; margin: 0 0 8px; }
          p { color: #71717A; line-height: 1.6; margin: 0 0 16px; }
          .highlight { background: #f5f3ff; border-left: 3px solid #7C3AED; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; color: #4C1D95; font-size: 14px; }
          .footer { margin-top: 24px; font-size: 12px; color: #a1a1aa; text-align: center; }
        </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Mentor<span>IA</span></div>
            <h2>Bem-vindo ao MentorIA! 🎓</h2>
            <p>O aluno <strong>${studentName}</strong> acabou de criar a conta no MentorIA, um tutor educacional com inteligência artificial.</p>
            <div class="highlight">
              ✅ Conta ativa e pronta para usar<br>
              📊 Você receberá relatórios semanais de progresso neste e-mail<br>
              🔥 Streak, XP e notas nos quizzes estarão no relatório
            </div>
            <p>O MentorIA ajuda ${studentName} a estudar com tutoria personalizada, flashcards gerados por IA e quizzes adaptativos — tudo no ritmo dele.</p>
            <p>Qualquer dúvida, acesse <strong>mentoria-flame.vercel.app</strong>.</p>
            <div class="footer">Sant.IA.Go · MentorIA — tutor educacional inteligente</div>
          </div>
        </body>
        </html>`

        try {
            await resend.emails.send({
                from: 'MentorIA <relatorios@mentoria.santiago.ai>',
                to: parentEmail,
                subject: `${studentName} acabou de entrar no MentorIA 🎓`,
                html,
            })
            return res.status(200).json({ ok: true })
        } catch (err: any) {
            return res.status(500).json({ error: err.message })
        }
    }

    // ── Relatório semanal ─────────────────────────────────────────────────
    const {
        studyMinutes,
        quizAverage,
        streak,
        xpEarned,
        weakPoints,
    } = req.body as WeeklyReportPayload

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 16px; padding: 32px; max-width: 520px; margin: 0 auto; }
        .logo { font-size: 24px; font-weight: 900; color: #7C3AED; margin-bottom: 24px; }
        .logo span { color: #18181B; }
        h2 { color: #18181B; margin: 0 0 8px; }
        p { color: #71717A; line-height: 1.6; }
        .stat { background: #f9fafb; border-radius: 12px; padding: 16px; margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
        .stat-value { font-size: 22px; font-weight: 800; color: #7C3AED; }
        .weak { background: #fef2f2; border-radius: 8px; padding: 8px 12px; margin: 4px 0; font-size: 14px; color: #dc2626; }
        .footer { margin-top: 24px; font-size: 12px; color: #a1a1aa; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Mentor<span>IA</span></div>
        <h2>Relatório Semanal de ${studentName}</h2>
        <p>Aqui está um resumo do desempenho de ${studentName} essa semana:</p>

        <div class="stat">
          <span>⏱️ Tempo de estudo</span>
          <span class="stat-value">${studyMinutes} min</span>
        </div>
        <div class="stat">
          <span>⚡ XP conquistado</span>
          <span class="stat-value">${xpEarned} XP</span>
        </div>
        <div class="stat">
          <span>🔥 Streak atual</span>
          <span class="stat-value">${streak} dias</span>
        </div>
        ${quizAverage !== null ? `
        <div class="stat">
          <span>📊 Média nos quizzes</span>
          <span class="stat-value">${quizAverage}%</span>
        </div>` : ''}

        ${weakPoints.length > 0 ? `
        <p style="margin-top: 20px; font-weight: 600; color: #18181B;">Pontos que precisam de atenção:</p>
        ${weakPoints.map(p => `<div class="weak">⚠️ ${p}</div>`).join('')}
        ` : '<p style="color: #10B981; font-weight: 600; margin-top: 16px;">✅ Ótimo desempenho em todos os tópicos!</p>'}

        <div class="footer">
          Relatório automático gerado pelo MentorIA · Sant.IA.Go
        </div>
      </div>
    </body>
    </html>
    `

    try {
        await resend.emails.send({
            from: 'MentorIA <relatorios@mentoria.santiago.ai>',
            to: parentEmail,
            subject: `Relatório semanal de ${studentName} — MentorIA`,
            html,
        })
        return res.status(200).json({ ok: true })
    } catch (err: any) {
        return res.status(500).json({ error: err.message })
    }
}
