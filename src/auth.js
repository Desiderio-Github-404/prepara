import { supabase, isSupabaseConfigured } from './lib/supabase.js'

const iconArrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

function authShell(content) {
  return `
    <main class="auth-screen">
      <div class="auth-glow"></div>
      <a class="brand auth-brand" href="#inicio"><span class="brand-mark">P</span><span>prepara<span class="brand-dot">.</span></span></a>
      <section class="auth-card">${content}</section>
      <p class="auth-back"><a href="#inicio">← Voltar à página inicial</a></p>
    </main>`
}

function showMessage(message, type = 'error') {
  const el = document.querySelector('.auth-message')
  if (!el) return
  el.textContent = message
  el.className = `auth-message ${type === 'success' ? 'message-success' : 'message-error'}`
  el.hidden = false
}

export async function renderAuth(app, mode = 'login') {
  if (!isSupabaseConfigured) {
    app.innerHTML = authShell(`
      <div class="auth-eyebrow">CONFIGURAÇÃO NECESSÁRIA</div>
      <h1>Estamos a preparar a tua área.</h1>
      <p class="auth-description">A autenticação será ativada assim que ligarmos o projeto Prepara ao Supabase.</p>
      <div class="setup-callout">Adiciona <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> às variáveis de ambiente do Vercel.</div>
      <a class="button button-primary auth-submit" href="#inicio">Voltar ao início ${iconArrow}</a>
    `)
    return
  }

  const isSignup = mode === 'signup'
  app.innerHTML = authShell(`
    <div class="auth-eyebrow">A TUA JORNADA COMEÇA AQUI</div>
    <h1>${isSignup ? 'Cria a tua conta.' : 'Bem-vindo de volta.'}</h1>
    <p class="auth-description">${isSignup ? 'Regista-te para preparares os teus estudos com mais estratégia.' : 'Entra na tua conta para continuares a tua preparação.'}</p>
    <form class="auth-form" id="auth-form">
      ${isSignup ? '<label>Nome completo<input name="full_name" type="text" autocomplete="name" placeholder="Como te chamas?" minlength="2" required></label>' : ''}
      <label>Endereço de e-mail<input name="email" type="email" autocomplete="email" placeholder="exemplo@email.com" required></label>
      <label>Palavra-passe<input name="password" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" placeholder="Mínimo de 8 caracteres" minlength="8" required></label>
      <p class="auth-message" hidden role="status"></p>
      <button class="button button-primary auth-submit" type="submit">${isSignup ? 'Criar conta' : 'Entrar'} ${iconArrow}</button>
    </form>
    <p class="auth-switch">${isSignup ? 'Já tens uma conta?' : 'Ainda não tens conta?'} <a href="#${isSignup ? 'entrar' : 'criar-conta'}">${isSignup ? 'Entrar' : 'Criar conta'}</a></p>
    <p class="auth-legal">Ao continuar, concordas com as condições de utilização da Prepara.</p>
  `)

  const form = document.querySelector('#auth-form')
  form.addEventListener('submit', async event => {
    event.preventDefault()
    const data = new FormData(form)
    const email = String(data.get('email')).trim().toLowerCase()
    const password = String(data.get('password'))
    const submit = form.querySelector('button[type="submit"]')
    submit.disabled = true
    submit.textContent = 'A processar...'
    try {
      if (isSignup) {
        const fullName = String(data.get('full_name')).trim()
        const { data: result, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + '/#entrar',
          },
        })
        if (error) throw error
        if (result.session) {
          window.location.hash = '#painel'
        } else {
          showMessage('Conta criada. Verifica o teu e-mail para confirmares o registo antes de entrares.', 'success')
          form.reset()
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.hash = '#painel'
      }
    } catch (error) {
      showMessage(error.message || 'Não foi possível concluir a operação. Tenta novamente.')
    } finally {
      submit.disabled = false
      submit.innerHTML = `${isSignup ? 'Criar conta' : 'Entrar'} ${iconArrow}`
    }
  })
}

export async function renderStudentPanel(app) {
  if (!isSupabaseConfigured) {
    window.location.hash = '#entrar'
    return
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    window.location.hash = '#entrar'
    return
  }

  const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Estudante'

  // Primeiro lemos todas as subscrições deste utilizador para diagnosticar
  // estados diferentes de "active" e evitar esconder erros do Supabase.
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('plan,status,expires_at,created_at,user_id')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (subscriptionError) {
    app.innerHTML = authShell(`
      <div class="auth-eyebrow">ÁREA DO ESTUDANTE</div>
      <h1>Olá, ${escapeHtml(name)}.</h1>
      <p class="auth-description">A tua conta está autenticada, mas não conseguimos consultar a subscrição.</p>
      <div class="setup-callout"><strong>Erro do Supabase:</strong><br>${escapeHtml(subscriptionError.message)}<br><br><strong>Conta autenticada:</strong><br>${escapeHtml(session.user.email || 'E-mail não disponível')}</div>
      <button class="button button-outline auth-submit" id="logout-button" type="button">Terminar sessão</button>
    `)
    document.querySelector('#logout-button').addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.hash = '#inicio'
    })
    return
  }

  const now = Date.now()
  const active = (subscriptions || []).find(item =>
    item.status === 'active' && (!item.expires_at || new Date(item.expires_at).getTime() > now)
  )
  const latest = subscriptions?.[0]

  let planTitle = 'Ainda não tens um plano ativo'
  let planDescription = 'Escolhe um plano na página inicial e conclui a inscrição para desbloqueares as ferramentas.'
  if (active) {
    planTitle = active.plan.toUpperCase()
    planDescription = 'A tua subscrição está ativa.'
  } else if (latest) {
    planDescription = `Encontrámos uma subscrição com estado "${latest.status}". Se acabaste de efectuar uma activação, confirma os dados no Supabase.`
  } else {
    planDescription = 'Não encontrámos subscrições associadas a esta conta.'
  }

  app.innerHTML = authShell(`
    <div class="auth-eyebrow">ÁREA DO ESTUDANTE</div>
    <h1>Olá, ${escapeHtml(name)}.</h1>
    <p class="auth-description">Bem-vindo à tua área pessoal da Prepara.</p>
    <div class="student-plan">
      <span class="student-plan-label">O TEU PLANO</span>
      <strong>${escapeHtml(planTitle)}</strong>
      <p>${escapeHtml(planDescription)}</p>
      <small style="display:block;margin-top:10px;opacity:.7">Conta: ${escapeHtml(session.user.email || '')}</small>
    </div>
    <div class="student-actions">
      <a class="button button-primary auth-submit" href="#planos">Ver planos ${iconArrow}</a>
      <button class="button button-outline auth-submit" id="logout-button" type="button">Terminar sessão</button>
    </div>
  `)
  document.querySelector('#logout-button').addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.hash = '#inicio'
  })
}
