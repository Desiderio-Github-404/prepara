const GEMINI_MODEL = 'gemini-3.8-flash'
const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_MESSAGES = 8

function send(res, status, payload) {
  res.status(status).json(payload)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { error: 'Método não permitido.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!apiKey) return send(res, 503, { error: 'O assistente ainda não está configurado. Adiciona a chave Gemini nas variáveis de ambiente do servidor.' })
  if (!supabaseUrl || !supabaseAnonKey) return send(res, 503, { error: 'A autenticação do serviço não está configurada no servidor.' })

  const authorization = req.headers.authorization || ''
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!accessToken) return send(res, 401, { error: 'Inicia sessão para utilizares o assistente.' })

  try {
    const userResponse = await fetch(supabaseUrl.replace(/\/$/, '') + '/auth/v1/user', {
      headers: { apikey: supabaseAnonKey, Authorization: 'Bearer ' + accessToken }
    })
    if (!userResponse.ok) return send(res, 401, { error: 'A tua sessão expirou. Entra novamente na tua conta.' })
    const user = await userResponse.json()

    const subscriptionUrl = new URL(supabaseUrl.replace(/\/$/, '') + '/rest/v1/subscriptions')
    subscriptionUrl.searchParams.set('select', 'plan,status,expires_at')
    subscriptionUrl.searchParams.set('user_id', 'eq.' + user.id)
    subscriptionUrl.searchParams.set('status', 'eq.active')
    const subscriptionResponse = await fetch(subscriptionUrl, {
      headers: { apikey: supabaseAnonKey, Authorization: 'Bearer ' + accessToken }
    })
    if (!subscriptionResponse.ok) return send(res, 503, { error: 'Não foi possível validar o teu plano. Tenta novamente.' })
    const subscriptions = await subscriptionResponse.json()
    const now = Date.now()
    const active = subscriptions.find(item =>
      ['starter', 'pro'].includes(item.plan) &&
      (!item.expires_at || new Date(item.expires_at).getTime() > now)
    )
    if (!active) return send(res, 403, { error: 'O Assistente IA está disponível para estudantes com uma subscrição Starter ou Pro activa.' })

    const body = req.body || {}
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    if (!message) return send(res, 400, { error: 'Escreve a tua pergunta.' })
    if (message.length > MAX_MESSAGE_LENGTH) return send(res, 413, { error: 'A tua pergunta é demasiado longa. Usa até 4.000 caracteres.' })

    const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY_MESSAGES) : []
    const contents = history
      .filter(item => item && ['user', 'model'].includes(item.role) && typeof item.text === 'string')
      .map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, MAX_MESSAGE_LENGTH) }] }))
    contents.push({ role: 'user', parts: [{ text: message }] })

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'És o Assistente Académico da Prepara, uma plataforma educativa para estudantes em Angola. Responde em português claro, preferencialmente português de Angola. Ensina, não te limites a dar respostas: explica o raciocínio passo a passo, usa exemplos simples e verifica a compreensão quando adequado. Em Matemática, Física, Química e disciplinas técnicas, apresenta fórmulas, unidades e etapas de resolução. Se a pergunta estiver incompleta, pede os dados em falta. Não inventes factos, conteúdos de programas escolares, referências ou resultados. Se não tiveres certeza, diz isso claramente. Mantém respostas organizadas e adequadas ao nível académico indicado pelo estudante.'
            }]
          },
          contents,
          generationConfig: { temperature: 0.45, maxOutputTokens: 1200 }
        })
      }
    )

    const result = await geminiResponse.json()
    if (!geminiResponse.ok) {
      const detail = result?.error?.message || 'O serviço de IA não conseguiu responder.'
      return send(res, geminiResponse.status === 429 ? 429 : 502, {
        error: geminiResponse.status === 429
          ? 'O assistente está a receber muitas perguntas neste momento. Aguarda um pouco e tenta novamente.'
          : 'Não foi possível obter uma resposta da IA. ' + detail.slice(0, 220)
      })
    }

    const answer = result?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim()
    if (!answer) return send(res, 502, { error: 'A IA não devolveu uma resposta. Reformula a pergunta e tenta novamente.' })
    return send(res, 200, { answer, plan: active.plan })
  } catch (error) {
    return send(res, 500, { error: 'Ocorreu um erro ao contactar o assistente. Tenta novamente.' })
  }
}
