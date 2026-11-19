import { supabase, isSupabaseConfigured } from './lib/supabase.js'

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
const ico = (name) => {
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10h-7v-7h-4v7H3z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    spark:'<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/>',
    history:'<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    video:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    logout:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>'
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.spark) + '</svg>'
}
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}
function shell(content) {
  return '<main class="auth-screen"><div class="auth-glow"></div><a class="brand auth-brand" href="#inicio"><span class="brand-mark">P</span><span>prepara<span class="brand-dot">.</span></span></a><section class="auth-card">' + content + '</section><p class="auth-back"><a href="#inicio">← Voltar à página inicial</a></p></main>'
}
function message(text, type = 'error') {
  const el = document.querySelector('.auth-message')
  if (!el) return
  el.textContent = text
  el.className = 'auth-message ' + (type === 'success' ? 'message-success' : 'message-error')
  el.hidden = false
}

export async function renderAuth(app, mode = 'login') {
  if (!isSupabaseConfigured) {
    app.innerHTML = shell('<div class="auth-eyebrow">CONFIGURAÇÃO NECESSÁRIA</div><h1>Estamos a preparar a tua área.</h1><p class="auth-description">A autenticação será ativada assim que ligarmos o projeto Prepara ao Supabase.</p><div class="setup-callout">Adiciona <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> às variáveis de ambiente do Vercel.</div><a class="button button-primary auth-submit" href="#inicio">Voltar ao início ' + arrow + '</a>')
    return
  }
  const signup = mode === 'signup'
  app.innerHTML = shell(
    '<div class="auth-eyebrow">A TUA JORNADA COMEÇA AQUI</div><h1>' + (signup ? 'Cria a tua conta.' : 'Bem-vindo de volta.') + '</h1><p class="auth-description">' + (signup ? 'Regista-te para preparares os teus estudos com mais estratégia.' : 'Entra na tua conta para continuares a tua preparação.') + '</p>' +
    '<form class="auth-form" id="auth-form">' +
    (signup ? '<label>Nome completo<input name="full_name" type="text" autocomplete="name" placeholder="Como te chamas?" minlength="2" required></label>' : '') +
    '<label>Endereço de e-mail<input name="email" type="email" autocomplete="email" placeholder="exemplo@email.com" required></label><label>Palavra-passe<input name="password" type="password" autocomplete="' + (signup ? 'new-password' : 'current-password') + '" placeholder="Mínimo de 8 caracteres" minlength="8" required></label><p class="auth-message" hidden role="status"></p><button class="button button-primary auth-submit" type="submit">' + (signup ? 'Criar conta' : 'Entrar') + ' ' + arrow + '</button></form>' +
    '<p class="auth-switch">' + (signup ? 'Já tens uma conta?' : 'Ainda não tens conta?') + ' <a href="#' + (signup ? 'entrar' : 'criar-conta') + '">' + (signup ? 'Entrar' : 'Criar conta') + '</a></p><p class="auth-legal">Ao continuar, concordas com as condições de utilização da Prepara.</p>'
  )
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
      if (signup) {
        const fullName = String(data.get('full_name')).trim()
        const {data: result, error} = await supabase.auth.signUp({email,password,options:{data:{full_name:fullName},emailRedirectTo:window.location.origin + '/#entrar'}})
        if (error) throw error
        if (result.session) window.location.hash = '#painel'
        else { message('Conta criada. Verifica o teu e-mail para confirmares o registo antes de entrares.', 'success'); form.reset() }
      } else {
        const {error} = await supabase.auth.signInWithPassword({email,password})
        if (error) throw error
        window.location.hash = '#painel'
      }
    } catch (error) { message(error.message || 'Não foi possível concluir a operação. Tenta novamente.') }
    finally { submit.disabled = false; submit.innerHTML = (signup ? 'Criar conta' : 'Entrar') + ' ' + arrow }
  })
}

export async function renderStudentPanel(app) {
  if (!isSupabaseConfigured) { window.location.hash = '#entrar'; return }
  const {data:{session}, error:sessionError} = await supabase.auth.getSession()
  if (sessionError || !session) { window.location.hash = '#entrar'; return }
  const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Estudante'
  const first = name.trim().split(/\s+/)[0]
  const {data:subs, error} = await supabase.from('subscriptions').select('plan,status,expires_at,created_at,user_id').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(5)
  if (error) {
    app.innerHTML = shell('<div class="auth-eyebrow">ÁREA DO ESTUDANTE</div><h1>Olá, ' + esc(name) + '.</h1><p class="auth-description">Não conseguimos consultar a tua subscrição.</p><div class="setup-callout">' + esc(error.message) + '</div><button class="button button-outline auth-submit" id="logout-button">Terminar sessão</button>')
    document.querySelector('#logout-button').addEventListener('click', async () => { await supabase.auth.signOut(); window.location.hash = '#inicio' })
    return
  }
  const active = (subs || []).find(s => s.status === 'active' && (!s.expires_at || new Date(s.expires_at).getTime() > Date.now()))
  const latest = subs?.[0]
  const plan = active?.plan === 'pro' ? 'pro' : active?.plan === 'starter' ? 'starter' : null
  const planLabel = plan ? plan.toUpperCase() : 'SEM PLANO'
  const planInfo = active ? 'A tua subscrição está activa. Aproveita as ferramentas disponíveis no teu plano.' : latest ? 'A tua última subscrição está com o estado "' + latest.status + '". Se fizeste um pagamento, a confirmação poderá estar pendente.' : 'Ainda não existe uma subscrição associada à tua conta. Escolhe um plano para começares.'
  const items = [['overview','Visão geral','home'],['study','Plano de estudos','calendar'],['exams','Gerar simulados','file'],['assistant','Assistente IA','spark'],['history','Histórico','history'],['account','Minha conta','user']]
  let view = 'overview'

  function dateValue(date) {
    return new Intl.DateTimeFormat('pt-AO',{day:'2-digit',month:'2-digit'}).format(date)
  }

  function buildStudySchedule(input) {
    const start = new Date()
    start.setHours(0,0,0,0)
    const end = new Date(input.exam_date + 'T00:00:00')
    const totalDays = Math.max(1, Math.ceil((end - start) / 86400000))
    const studyDays = Math.max(1, Math.min(totalDays, 60))
    const subjects = input.subjects
    const tasks = []
    for (let i = 0; i < studyDays; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      const subject = subjects[i % subjects.length]
      const secondSubject = subjects.length > 1 ? subjects[(i + 1) % subjects.length] : null
      const isReview = (i + 1) % 6 === 0 || i === studyDays - 1
      tasks.push({
        date: day.toISOString().slice(0,10),
        label: dateValue(day),
        subject: isReview ? 'Revisão geral' : subject,
        detail: isReview
          ? 'Rever apontamentos, resolver questões e identificar dúvidas.'
          : 'Estudar os conceitos principais, fazer apontamentos e resolver exercícios.' + (secondSubject && input.hours_per_day >= 2 ? ' Reservar parte do tempo para ' + secondSubject + '.' : ''),
        minutes: Math.round(Number(input.hours_per_day) * 60),
        completed: false
      })
    }
    return tasks
  }

  async function loadStudyPlans(area) {
    const {data, error} = await supabase.from('study_plans')
      .select('id,title,goal,academic_level,exam_type,exam_date,subjects,hours_per_day,knowledge_level,schedule,created_at')
      .eq('user_id', session.user.id)
      .order('created_at',{ascending:false})
      .limit(10)
    if (error) {
      area.querySelector('#study-plans-list').innerHTML = '<p class="study-feedback error">Não foi possível carregar os planos. Confirma se já executaste o SQL de configuração.</p>'
      return
    }
    const list = area.querySelector('#study-plans-list')
    if (!data?.length) {
      list.innerHTML = '<div class="study-empty">Ainda não guardaste nenhum plano. Preenche o formulário para criares o primeiro.</div>'
      return
    }
    list.innerHTML = data.map(p => '<article class="study-saved-card"><div><span class="dash-eyebrow">' + esc(p.exam_type) + ' · ' + esc(p.academic_level) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc((p.subjects || []).join(', ')) + '</p><small>Avaliação: ' + esc(p.exam_date) + ' · ' + esc(p.hours_per_day) + ' h/dia</small></div><button type="button" class="dash-secondary-button" data-plan-id="' + esc(p.id) + '">Ver plano</button></article>').join('')
    list.querySelectorAll('[data-plan-id]').forEach(button => button.addEventListener('click', () => {
      const selected = data.find(p => p.id === button.dataset.planId)
      if (selected) showStudySchedule(area, selected)
    }))
  }

  async function showStudySchedule(area, planData) {
    let schedule = Array.isArray(planData.schedule) ? planData.schedule.map(item => ({...item, completed: item.completed === true})) : []
    area.querySelector('#study-result')?.remove()
    const result = document.createElement('section')
    result.id = 'study-result'
    result.className = 'study-result'

    function updateProgress() {
      const completedCount = schedule.filter(item => item.completed).length
      const progress = schedule.length ? Math.round((completedCount / schedule.length) * 100) : 0
      result.querySelector('#study-progress-value').textContent = progress + '%'
      result.querySelector('#study-progress-bar').style.width = progress + '%'
      result.querySelector('#study-progress-count').textContent = completedCount + ' de ' + schedule.length + ' tarefas concluídas'
    }

    function renderTasks() {
      result.querySelector('.study-schedule').innerHTML = schedule.map((item,index) =>
        '<article class="study-day ' + (item.completed ? 'is-completed' : '') + '">' +
          '<span class="study-day-number">DIA ' + (index+1) + '</span>' +
          '<div class="study-day-content"><b>' + esc(item.label) + ' — ' + esc(item.subject) + '</b><p>' + esc(item.detail) + '</p><small>' + esc(item.minutes) + ' minutos previstos</small></div>' +
          '<label class="study-task-toggle"><input type="checkbox" data-task-index="' + index + '"' + (item.completed ? ' checked' : '') + '><span>' + (item.completed ? 'Concluída' : 'Concluir') + '</span></label>' +
        '</article>'
      ).join('')
      result.querySelectorAll('[data-task-index]').forEach(toggle => {
        toggle.addEventListener('change', async () => {
          const index = Number(toggle.dataset.taskIndex)
          const previous = schedule[index].completed
          schedule[index].completed = toggle.checked
          toggle.disabled = true
          const feedback = result.querySelector('#study-save-feedback')
          feedback.textContent = 'A guardar o progresso...'
          const {error: updateError} = await supabase.from('study_plans')
            .update({schedule})
            .eq('id', planData.id)
            .eq('user_id', session.user.id)
          toggle.disabled = false
          if (updateError) {
            schedule[index].completed = previous
            toggle.checked = previous
            feedback.textContent = 'Não foi possível guardar. Tenta novamente.'
            feedback.className = 'study-save-feedback error'
          } else {
            feedback.textContent = 'Progresso guardado.'
            feedback.className = 'study-save-feedback success'
            toggle.nextElementSibling.textContent = toggle.checked ? 'Concluída' : 'Concluir'
            toggle.closest('.study-day').classList.toggle('is-completed', toggle.checked)
            planData.schedule = schedule.map(item => ({...item}))
            updateProgress()
            updateReorganizeButton()
          }
        })
      })
    }

    function getOverduePending() {
      const today = new Date()
      today.setHours(0,0,0,0)
      return schedule.filter(item => {
        if (item.completed || !item.date) return false
        return new Date(item.date + 'T00:00:00') < today
      })
    }

    function updateReorganizeButton() {
      const button = result.querySelector('#reorganize-study-plan')
      if (!button) return
      button.hidden = getOverduePending().length === 0
    }

    const completedCount = schedule.filter(item => item.completed).length
    const progress = schedule.length ? Math.round((completedCount / schedule.length) * 100) : 0
    result.innerHTML =
      '<div class="study-result-head"><div><span class="dash-eyebrow">PLANO PERSONALIZADO</span><h2>' + esc(planData.title) + '</h2><p>' + esc(planData.goal) + ' · ' + esc(planData.exam_type) + '</p></div><button type="button" class="dash-secondary-button" id="close-study-result">Fechar</button></div>' +
      '<div class="study-progress"><div class="study-progress-top"><b>O teu progresso</b><strong id="study-progress-value">' + progress + '%</strong></div><div class="study-progress-track"><span id="study-progress-bar" style="width:' + progress + '%"></span></div><small id="study-progress-count">' + completedCount + ' de ' + schedule.length + ' tarefas concluídas</small></div>' +
      '<div class="study-reorganize-box"><div><b>Ficaste com tarefas atrasadas?</b><p>A Prepara pode redistribuir as tarefas por concluir pelos dias que restam, sem alterar as que já concluíste.</p></div><button type="button" class="dash-primary-button" id="reorganize-study-plan" hidden>Reorganizar plano</button></div>' +
      '<div class="study-schedule"></div>' +
      '<p class="study-save-feedback" id="study-save-feedback" role="status" aria-live="polite"></p>'
    area.append(result)
    result.querySelector('#close-study-result').addEventListener('click', () => result.remove())
    renderTasks()
    updateReorganizeButton()

    result.querySelector('#reorganize-study-plan').addEventListener('click', async () => {
      const feedback = result.querySelector('#study-save-feedback')
      const button = result.querySelector('#reorganize-study-plan')
      const today = new Date()
      today.setHours(0,0,0,0)
      const examDay = new Date(planData.exam_date + 'T00:00:00')
      const availableDays = Math.ceil((examDay - today) / 86400000) - 1
      const pending = schedule.filter(item => !item.completed)
      if (availableDays < 1) {
        feedback.textContent = 'A data da avaliação já chegou ou não existem dias de estudo disponíveis. Actualiza a data da avaliação para reorganizar.'
        feedback.className = 'study-save-feedback error'
        return
      }
      if (!pending.length) {
        feedback.textContent = 'Não existem tarefas por concluir.'
        feedback.className = 'study-save-feedback success'
        button.hidden = true
        return
      }

      const dailyCapacity = Math.max(1, Math.round(Number(planData.hours_per_day) * 60))
      const totalCapacity = dailyCapacity * availableDays
      const minutesPerTask = Math.max(1, Math.floor(totalCapacity / pending.length))
      const nextSchedule = schedule.filter(item => item.completed).map(item => ({...item}))
      const pendingTasks = pending.map(item => ({...item}))
      const buckets = Array.from({length:availableDays}, (_,index) => {
        const day = new Date(today)
        day.setDate(today.getDate() + index + 1)
        return {date:day.getFullYear() + '-' + String(day.getMonth()+1).padStart(2,'0') + '-' + String(day.getDate()).padStart(2,'0'), load:0, tasks:[]}
      })

      pendingTasks.forEach(task => {
        let bucket = buckets.reduce((lightest,current) => current.load < lightest.load ? current : lightest, buckets[0])
        const allocatedMinutes = Math.min(minutesPerTask, dailyCapacity - bucket.load)
        if (allocatedMinutes < 1) return
        task.date = bucket.date
        task.label = dateValue(new Date(bucket.date + 'T00:00:00'))
        task.minutes = allocatedMinutes
        bucket.load += allocatedMinutes
        bucket.tasks.push(task)
      })

      const scheduledTasks = buckets.flatMap(bucket => bucket.tasks)
      if (scheduledTasks.length !== pendingTasks.length) {
        feedback.textContent = 'Não foi possível distribuir todas as tarefas dentro do tempo diário disponível. Reduz o número de tarefas ou aumenta as horas de estudo.'
        feedback.className = 'study-save-feedback error'
        return
      }
      const completedTasks = schedule.filter(item => item.completed)
      const reordered = [...completedTasks, ...scheduledTasks].sort((a,b) => a.date.localeCompare(b.date))
      button.disabled = true
      button.textContent = 'A reorganizar...'
      feedback.textContent = 'A distribuir as tarefas pelos dias disponíveis...'
      feedback.className = 'study-save-feedback'
      const {error: updateError} = await supabase.from('study_plans')
        .update({schedule:reordered})
        .eq('id', planData.id)
        .eq('user_id', session.user.id)
      button.disabled = false
      button.textContent = 'Reorganizar plano'
      if (updateError) {
        feedback.textContent = 'Não foi possível guardar o novo calendário. O plano anterior foi mantido.'
        feedback.className = 'study-save-feedback error'
        return
      }
      schedule = reordered
      planData.schedule = schedule.map(item => ({...item}))
      renderTasks()
      updateProgress()
      updateReorganizeButton()
      feedback.textContent = 'Plano reorganizado e guardado. As tarefas concluídas foram preservadas.'
      feedback.className = 'study-save-feedback success'
    })
    result.scrollIntoView({behavior:'smooth',block:'start'})
  }

  function renderStudyTool(area) {
    area.innerHTML = '<section class="study-builder"><div class="study-builder-heading"><span class="dash-eyebrow">PLANEAMENTO INTELIGENTE</span><h1>Cria o teu plano de estudos.</h1><p>Conta-nos o que precisas de preparar. A Prepara vai organizar uma rotina prática para começares hoje.</p></div><form id="study-form" class="study-form"><label>Classe ou nível académico<select name="academic_level" required><option value="">Selecciona</option><option>7.ª classe</option><option>8.ª classe</option><option>9.ª classe</option><option>10.ª classe</option><option>11.ª classe</option><option>12.ª classe</option><option>13.ª classe</option><option>Ensino superior</option><option>Outro</option></select></label><label>Objectivo<select name="goal" required><option value="">Selecciona</option><option>Preparação para exame nacional</option><option>Exame de acesso</option><option>Prova trimestral</option><option>Preparação geral</option></select></label><label>Tipo de avaliação<select name="exam_type" required><option value="">Selecciona</option><option>Exame nacional</option><option>Exame de acesso</option><option>Prova trimestral</option><option>Teste</option><option>Estudo autónomo</option></select></label><label>Data da avaliação<input name="exam_date" type="date" min="' + new Date().toISOString().slice(0,10) + '" required></label><label>Horas disponíveis por dia<select name="hours_per_day" required><option value="">Selecciona</option><option value="1">1 hora</option><option value="2">2 horas</option><option value="3">3 horas</option><option value="4">4 horas</option><option value="5">5 horas</option><option value="6">6 horas</option></select></label><label>Nível de conhecimento<select name="knowledge_level" required><option value="">Selecciona</option><option>Iniciante</option><option>Intermédio</option><option>Avançado</option></select></label><fieldset class="study-subjects"><legend>Disciplinas que precisas de estudar</legend><div class="study-subject-grid">' + ['Matemática','Física','Química','Biologia','Língua Portuguesa','Inglês','Informática','Electrónica','Telecomunicações','História','Geografia','Outra'].map(s => '<label><input type="checkbox" name="subjects" value="' + s + '"><span>' + s + '</span></label>').join('') + '</div></fieldset><label class="study-title-field">Nome do plano<input name="title" type="text" maxlength="80" placeholder="Ex.: Preparação para o exame de acesso" required></label><p class="study-feedback" id="study-feedback" role="status" hidden></p><button class="dash-primary-button study-submit" type="submit">Gerar o meu plano ' + arrow + '</button></form></section><section class="study-library"><div class="dash-section-title"><div><span class="dash-eyebrow">OS TEUS PLANOS</span><h2>Planos guardados</h2></div></div><div id="study-plans-list"><p class="study-empty">A carregar os teus planos...</p></div></section>'
    loadStudyPlans(area)
    const form = area.querySelector('#study-form')
    form.addEventListener('submit', async event => {
      event.preventDefault()
      const data = new FormData(form)
      const subjects = data.getAll('subjects')
      const feedback = area.querySelector('#study-feedback')
      if (!subjects.length) {
        feedback.textContent = 'Selecciona pelo menos uma disciplina.'
        feedback.hidden = false
        feedback.className = 'study-feedback error'
        return
      }
      const examDate = new Date(String(data.get('exam_date')) + 'T00:00:00')
      const today = new Date(); today.setHours(0,0,0,0)
      const days = Math.ceil((examDate - today) / 86400000)
      if (days < 1 || days > 60) {
        feedback.textContent = 'Escolhe uma data entre amanhã e os próximos 60 dias. Depois poderemos ampliar o calendário.'
        feedback.hidden = false
        feedback.className = 'study-feedback error'
        return
      }
      const input = {
        title:String(data.get('title')).trim(),
        goal:String(data.get('goal')),
        academic_level:String(data.get('academic_level')),
        exam_type:String(data.get('exam_type')),
        exam_date:String(data.get('exam_date')),
        subjects,
        hours_per_day:Number(data.get('hours_per_day')),
        knowledge_level:String(data.get('knowledge_level'))
      }
      const schedule = buildStudySchedule(input)
      const submit = form.querySelector('button[type="submit"]')
      submit.disabled = true
      submit.textContent = 'A organizar o teu plano...'
      feedback.hidden = true
      try {
        const {data:saved,error:saveError} = await supabase.from('study_plans').insert({
          user_id:session.user.id,
          ...input,
          schedule
        }).select('id,title,goal,academic_level,exam_type,exam_date,subjects,hours_per_day,knowledge_level,schedule,created_at').single()
        if (saveError) throw saveError
        feedback.textContent = 'Plano criado e guardado com sucesso.'
        feedback.className = 'study-feedback success'
        feedback.hidden = false
        showStudySchedule(area,saved)
        await loadStudyPlans(area)
      } catch (saveError) {
        feedback.textContent = saveError.message || 'Não foi possível guardar o plano. Verifica a configuração da base de dados.'
        feedback.className = 'study-feedback error'
        feedback.hidden = false
      } finally {
        submit.disabled = false
        submit.innerHTML = 'Gerar o meu plano ' + arrow
      }
    })
  }



  function renderAssistantMarkdown(source) {
    const escapeHtml = value => value.replace(/[&<>"']/g, char => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[char]))
    const inline = value => escapeHtml(value)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
    const lines = String(source || '').replace(/\r/g, '').split('\n')
    const output = []
    let paragraph = []
    let listType = null
    let listItems = []
    let code = false
    let codeLines = []
    let math = false
    let mathLines = []

    const flushParagraph = () => {
      if (paragraph.length) {
        output.push('<p>' + paragraph.map(inline).join('<br>') + '</p>')
        paragraph = []
      }
    }
    const flushList = () => {
      if (listItems.length) {
        output.push('<' + listType + '>' + listItems.map(item => '<li>' + inline(item) + '</li>').join('') + '</' + listType + '>')
        listItems = []
        listType = null
      }
    }

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        flushParagraph(); flushList()
        if (code) {
          output.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>')
          codeLines = []
        }
        code = !code
        continue
      }
      if (code) { codeLines.push(line); continue }
      if (line.trim() === '$') {
        flushParagraph(); flushList()
        if (math) {
          output.push('<div class="assistant-math">' + escapeHtml(mathLines.join('\n')) + '</div>')
          mathLines = []
        }
        math = !math
        continue
      }
      if (math) { mathLines.push(line); continue }
      const trimmed = line.trim()
      if (!trimmed) { flushParagraph(); flushList(); continue }
      const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
      if (heading) {
        flushParagraph(); flushList()
        const level = heading[1].length
        output.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>')
        continue
      }
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushParagraph(); flushList(); output.push('<hr>'); continue
      }
      const bullet = trimmed.match(/^[-*]\s+(.+)$/)
      const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/)
      if (bullet || numbered) {
        flushParagraph()
        const type = bullet ? 'ul' : 'ol'
        if (listType && listType !== type) flushList()
        listType = type
        listItems.push((bullet || numbered)[1])
        continue
      }
      flushList()
      paragraph.push(trimmed)
    }
    flushParagraph(); flushList()
    if (codeLines.length) output.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>')
    if (mathLines.length) output.push('<div class="assistant-math">' + escapeHtml(mathLines.join('\n')) + '</div>')
    return output.join('')
  }

  function renderAssistant(area) {
    let history = []
    area.innerHTML =
      '<section class="assistant-panel">' +
        '<div class="assistant-heading"><span class="dash-eyebrow">APRENDIZAGEM COM IA</span><h1>Assistente académico.</h1><p>Faz perguntas, pede explicações passo a passo e aprofunda as matérias que estás a estudar.</p></div>' +
        '<div class="assistant-notice">O assistente é uma ferramenta de apoio ao estudo. Confirma sempre fórmulas, dados e orientações importantes com os teus materiais e professores.</div>' +
        '<div class="assistant-chat" id="assistant-chat" aria-live="polite"><div class="assistant-message assistant-model"><b>Prepara IA</b><p>Olá! Sou o teu assistente académico. Qual é a matéria ou dúvida que vamos trabalhar hoje?</p></div></div>' +
        '<form class="assistant-form" id="assistant-form"><textarea id="assistant-question" rows="3" maxlength="4000" placeholder="Escreve a tua pergunta..." required></textarea><div class="assistant-form-bottom"><small>Até 4.000 caracteres</small><button class="dash-primary-button" type="submit">Enviar pergunta ' + arrow + '</button></div></form>' +
        '<p class="assistant-feedback" id="assistant-feedback" role="status" aria-live="polite"></p>' +
      '</section>'

    const chat = area.querySelector('#assistant-chat')
    const form = area.querySelector('#assistant-form')
    const input = area.querySelector('#assistant-question')
    const submit = form.querySelector('button[type="submit"]')
    const feedback = area.querySelector('#assistant-feedback')

    function addMessage(role, text) {
      const item = document.createElement('article')
      item.className = 'assistant-message ' + (role === 'user' ? 'assistant-user' : 'assistant-model')
      const label = document.createElement('b')
      label.textContent = role === 'user' ? 'Tu' : 'Prepara IA'
      const body = document.createElement('div')
      body.className = 'assistant-body'
      if (role === 'model') body.innerHTML = renderAssistantMarkdown(text)
      else body.textContent = text
      item.append(label, body)
      chat.append(item)
      chat.scrollTop = chat.scrollHeight
      return item
    }

    form.addEventListener('submit', async event => {
      event.preventDefault()
      const question = input.value.trim()
      if (!question) return
      addMessage('user', question)
      input.value = ''
      input.disabled = true
      submit.disabled = true
      submit.textContent = 'A pensar...'
      feedback.textContent = 'A preparar uma explicação...'
      feedback.className = 'assistant-feedback'
      const pending = addMessage('model', 'Estou a analisar a tua pergunta...')
      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + session.access_token
          },
          body: JSON.stringify({message:question, history})
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Não foi possível obter uma resposta.')
        pending.querySelector('.assistant-body').innerHTML = renderAssistantMarkdown(result.answer)
        history.push({role:'user',text:question},{role:'model',text:result.answer})
        history = history.slice(-8)
        feedback.textContent = 'Resposta gerada. Continua a perguntar para aprofundares a matéria.'
        feedback.className = 'assistant-feedback success'
      } catch (error) {
        pending.remove()
        addMessage('model', error.message || 'Ocorreu um erro. Tenta novamente.')
        feedback.textContent = 'Não foi possível concluir o pedido.'
        feedback.className = 'assistant-feedback error'
      } finally {
        input.disabled = false
        submit.disabled = false
        submit.innerHTML = 'Enviar pergunta ' + arrow
        input.focus()
      }
    })
  }

  function renderContent() {
    const area = document.querySelector('#dashboard-content')
    if (!area) return
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view))
    if (view === 'overview') {
      area.innerHTML =
        '<div class="dash-welcome"><div><span class="dash-eyebrow">O TEU ESPAÇO DE PREPARAÇÃO</span><h1>Olá, ' + esc(first) + '. <span>✦</span></h1><p>Grandes resultados começam com pequenos passos consistentes.</p></div><div class="dash-date">' + new Intl.DateTimeFormat('pt-AO',{day:'numeric',month:'long',year:'numeric'}).format(new Date()) + '</div></div>' +
        '<section class="dash-plan-card"><div><span class="dash-eyebrow">O TEU PLANO ACTUAL</span><h2>' + planLabel + '</h2><p>' + esc(planInfo) + '</p></div><span class="dash-plan-badge ' + (plan ? 'is-active' : '') + '">' + (plan ? '● ACTIVO' : '● POR ACTIVAR') + '</span></section>' +
        '<div class="dash-section-title"><div><span class="dash-eyebrow">FERRAMENTAS DE ESTUDO</span><h2>O que vamos estudar hoje?</h2></div></div>' +
        '<div class="dash-tool-grid">' +
        [['study','calendar','Plano de estudos','Organiza a tua preparação por objectivos.'],['exams','file','Gerar simulados','Pratica com exercícios e provas de treino.'],['assistant','spark','Assistente académico IA','Esclarece dúvidas e aprofunda matérias.']].map(x => '<button class="dash-tool-card" data-open-view="' + x[0] + '"><span class="dash-tool-icon">' + ico(x[1]) + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small><span class="dash-card-link">Abrir ferramenta ' + arrow + '</span></button>').join('') +
        '</div>' +
        (plan === 'pro' ? '<section class="dash-pro-card"><div class="dash-pro-icon">' + ico('book') + '</div><div><span class="dash-eyebrow">BENEFÍCIOS PRO</span><h3>O teu acompanhamento exclusivo</h3><p>O livro de técnicas de estudo e as aulas semanais estarão reunidos nesta área.</p></div><button class="dash-secondary-button" data-open-view="pro">Ver benefícios ' + arrow + '</button></section>' :
        '<section class="dash-upgrade-card"><div><span class="dash-eyebrow">QUERES IR MAIS LONGE?</span><h3>Descobre a experiência Prepara Pro.</h3><p>Inclui técnicas de estudo e acompanhamento semanal.</p></div><a class="dash-primary-button" href="#planos">Conhecer o Pro ' + arrow + '</a></section>') +
        '<p class="dash-footnote">O painel está em desenvolvimento. As ferramentas serão activadas nas próximas etapas.</p>'
    } else if (view === 'study') {
      renderStudyTool(area)
    } else if (view === 'assistant') {
      renderAssistant(area)
    } else if (view === 'exams') {
      const d = ['PRÁTICA E AVALIAÇÃO','Gerar provas e simulados','Testa os teus conhecimentos antes do dia da avaliação.','O gerador será implementado nesta etapa, com selecção de disciplina, matéria, dificuldade e correcção.']
      area.innerHTML = '<section class="dash-placeholder"><span class="dash-placeholder-icon">' + ico('file') + '</span><span class="dash-eyebrow">' + d[0] + '</span><h1>' + d[1] + '</h1><p class="dash-placeholder-lead">' + d[2] + '</p><div class="dash-coming-soon"><b>EM DESENVOLVIMENTO</b><p>' + d[3] + '</p></div><button class="dash-secondary-button" data-open-view="overview">Voltar à visão geral</button></section>'
    } else if (view === 'history') {
      area.innerHTML = '<section class="dash-placeholder"><span class="dash-placeholder-icon">' + ico('history') + '</span><span class="dash-eyebrow">A TUA EVOLUÇÃO</span><h1>Histórico de actividades</h1><p class="dash-placeholder-lead">Aqui poderás consultar os teus planos, simulados e sessões com o assistente.</p><div class="dash-coming-soon"><b>AINDA SEM ACTIVIDADES</b><p>O histórico será preenchido quando as ferramentas estiverem ligadas e guardarem os teus resultados.</p></div></section>'
    } else if (view === 'account') {
      area.innerHTML = '<section class="dash-placeholder account-placeholder"><span class="dash-placeholder-icon">' + ico('user') + '</span><span class="dash-eyebrow">DADOS PESSOAIS</span><h1>Minha conta</h1><p class="dash-placeholder-lead">Informações da tua conta Prepara.</p><div class="dash-account-info"><span>Nome</span><b>' + esc(name) + '</b><span>E-mail</span><b>' + esc(session.user.email || '') + '</b><span>Plano</span><b>' + planLabel + '</b><span>Estado</span><b>' + (active ? 'Activo' : esc(latest?.status || 'Sem subscrição')) + '</b></div><button class="dash-logout-button" id="dashboard-logout">' + ico('logout') + ' Terminar sessão</button></section>'
      document.querySelector('#dashboard-logout')?.addEventListener('click', async () => { await supabase.auth.signOut(); window.location.hash = '#inicio' })
    } else if (view === 'pro') {
      area.innerHTML = '<section class="dash-placeholder"><span class="dash-placeholder-icon">' + ico('book') + '</span><span class="dash-eyebrow">EXCLUSIVO PRO</span><h1>Benefícios do teu plano Pro</h1><p class="dash-placeholder-lead">Uma experiência que combina ferramentas digitais com acompanhamento.</p><div class="dash-benefit-list"><div>' + ico('book') + '<span><b>Livro de técnicas de estudo</b><small>Material exclusivo para melhorares o teu método.</small></span></div><div>' + ico('video') + '<span><b>Aulas ao vivo semanais</b><small>Uma aula por semana, durante o mês.</small></span></div><div>' + ico('spark') + '<span><b>Acompanhamento</b><small>Orientação para manteres consistência e foco.</small></span></div></div><p class="dash-footnote">A área de conteúdos e calendário das aulas será activada numa próxima fase.</p></section>'
    }
    area.querySelectorAll('[data-open-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.openView; renderContent() }))
  }

  app.innerHTML = '<main class="student-dashboard"><aside class="dash-sidebar"><a class="brand dash-brand" href="#inicio"><span class="brand-mark">P</span><span>prepara<span class="brand-dot">.</span></span></a><div class="dash-sidebar-label">MENU PRINCIPAL</div><nav class="dash-nav">' +
    items.map(x => '<button data-view="' + x[0] + '" type="button">' + ico(x[2]) + '<span>' + x[1] + '</span></button>').join('') +
    '</nav>' + (plan ? '<div class="dash-sidebar-plan ' + (plan === 'pro' ? 'pro' : '') + '"><span>PLANO ACTIVO</span><b>PREPARA ' + planLabel + '</b><small>A tua subscrição está activa.</small></div>' : '<div class="dash-sidebar-plan"><span>O TEU PLANO</span><b>' + planLabel + '</b><small>Escolhe um plano para começar.</small><a href="#planos">Ver planos ' + arrow + '</a></div>') +
    '<button class="dash-logout-button" id="sidebar-logout">' + ico('logout') + '<span>Terminar sessão</span></button></aside><section class="dash-main"><header class="dash-topbar"><span class="dash-topbar-label">PREPARA / ÁREA DO ESTUDANTE</span><div class="dash-user"><span class="dash-avatar">' + esc(first.charAt(0).toUpperCase()) + '</span><span>' + esc(first) + '</span></div></header><div class="dash-content" id="dashboard-content"></div></section></main>'
  document.querySelectorAll('.dash-nav [data-view]').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; renderContent() }))
  document.querySelector('#sidebar-logout').addEventListener('click', async () => { await supabase.auth.signOut(); window.location.hash = '#inicio' })
  renderContent()
}
