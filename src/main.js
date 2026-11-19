import './style.css'
import { renderAuth, renderStudentPanel } from './auth.js'
import { supabase, isSupabaseConfigured } from './lib/supabase.js'

const checkoutUrls = {
  starter: import.meta.env.VITE_KURSINHA_STARTER_URL || '',
  pro: import.meta.env.VITE_KURSINHA_PRO_URL || '',
}

const icon = (name) => {
  const paths = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`
}

const features = [
  { icon: 'calendar', number: '01', title: 'Planos de estudo inteligentes', text: 'Organiza a tua preparação de acordo com a disciplina, a data da prova e o tempo que tens disponível.' },
  { icon: 'file', number: '02', title: 'Provas e simulados', text: 'Pratica com perguntas geradas a partir das matérias que precisas de dominar. Aprende também com as correções.' },
  { icon: 'spark', number: '03', title: 'Assistente académico com IA', text: 'Faz perguntas, esclarece dúvidas e recebe explicações para compreenderes os conteúdos, não apenas decorar respostas.' },
]

const app = document.querySelector('#app')
app.innerHTML = `
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="#inicio" aria-label="Prepara — início"><span class="brand-mark">P</span><span>prepara<span class="brand-dot">.</span></span></a>
      <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false">${icon('menu')}</button>
      <div class="header-actions"><a class="login-link" href="#entrar">Entrar</a><a class="button button-small button-outline header-cta" href="#criar-conta">Criar conta</a></div>
      <nav class="main-nav" aria-label="Navegação principal">
        <a href="#funcionalidades">Funcionalidades</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#planos">Planos</a>
      </nav>
      <a class="button button-small button-outline header-cta" href="#planos">Começar agora ${icon('arrow')}</a>
    </div>
  </header>

  <main>
    <section class="hero section" id="inicio">
      <div class="hero-glow"></div>
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> A tua preparação, elevada pela IA</div>
          <h1>Estuda com propósito.<br><span>Prepara-te para vencer.</span></h1>
          <p class="hero-text">Transforma a forma como te preparas para as provas. Cria planos de estudo, pratica com simulados e esclarece as tuas dúvidas com inteligência artificial.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#planos">Escolher o meu plano ${icon('arrow')}</a>
            <a class="text-link" href="#funcionalidades">Explorar funcionalidades <span>↘</span></a>
          </div>
          <div class="hero-note"><span class="note-check">${icon('check')}</span> Feito para estudantes que querem evoluir.</div>
        </div>
        <div class="hero-visual" aria-label="Pré-visualização ilustrativa do painel Prepara">
          <div class="visual-orbit orbit-one"></div><div class="visual-orbit orbit-two"></div>
          <div class="dashboard-card">
            <div class="mock-top"><div class="mock-brand"><span class="brand-mark mini">P</span> prepara</div><span class="mock-status"><i></i> A estudar</span></div>
            <div class="mock-greeting"><span>O TEU ESPAÇO DE ESTUDO</span><h3>Olá, estudante! <span>✦</span></h3><p>Um passo de cada vez. Vamos avançar?</p></div>
            <div class="mock-progress"><div class="progress-head"><span>Preparação para a prova</span><b>68%</b></div><div class="progress-track"><i></i></div><small>O teu progresso é construído todos os dias.</small></div>
            <div class="mock-tools">
              <div class="mock-tool"><span class="tool-icon purple">${icon('calendar')}</span><div><b>Plano de estudo</b><small>Organiza a tua semana</small></div><span class="tool-arrow">↗</span></div>
              <div class="mock-tool"><span class="tool-icon muted">${icon('file')}</span><div><b>Gerar simulado</b><small>Testa os teus conhecimentos</small></div><span class="tool-arrow">↗</span></div>
              <div class="mock-tool"><span class="tool-icon purple">${icon('spark')}</span><div><b>Assistente IA</b><small>Tira as tuas dúvidas</small></div><span class="tool-arrow">↗</span></div>
            </div>
            <div class="mock-footer"><span>PREPARA</span><span>O teu próximo passo começa agora.</span></div>
          </div>
          <div class="floating-chip chip-top"><span>✦</span> Aprende ao teu ritmo</div>
          <div class="floating-chip chip-bottom"><span class="chip-check">${icon('check')}</span> Mais organização. Mais confiança.</div>
        </div>
      </div>
      <div class="container hero-bottom"><span>UMA NOVA FORMA DE ESTUDAR</span><div class="bottom-line"></div><span>TECNOLOGIA + MÉTODO + CONSISTÊNCIA</span></div>
    </section>

    <section class="intro-strip">
      <div class="container intro-inner"><p>Não estudes apenas mais.<br><strong>Estuda melhor.</strong></p><span>A ferramenta certa pode transformar a tua preparação.</span></div>
    </section>

    <section class="section features-section" id="funcionalidades">
      <div class="container">
        <div class="section-heading">
          <div><div class="eyebrow">O QUE PODES FAZER</div><h2>Tudo o que precisas para<br><span>uma preparação mais forte.</span></h2></div>
          <p>Reúne num só lugar ferramentas que te ajudam a organizar, praticar e compreender melhor cada matéria.</p>
        </div>
        <div class="feature-grid">
          ${features.map(f => `<article class="feature-card"><div class="feature-card-top"><span class="feature-icon">${icon(f.icon)}</span><span class="feature-number">${f.number}</span></div><h3>${f.title}</h3><p>${f.text}</p><a href="#planos" class="feature-link">Quero experimentar <span>↗</span></a></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section method-section" id="como-funciona">
      <div class="container method-grid">
        <div class="method-copy"><div class="eyebrow">SIMPLES PARA COMEÇAR</div><h2>O teu próximo resultado começa com <span>um plano.</span></h2><p>Escolhe as ferramentas de que precisas e transforma a intenção de estudar numa rotina que consegues cumprir.</p><a class="button button-primary" href="#planos">Ver planos disponíveis ${icon('arrow')}</a></div>
        <div class="steps">
          <div class="step"><span class="step-index">01</span><div><h3>Escolhe o teu plano</h3><p>Compara as opções e seleciona a experiência adequada aos teus objetivos.</p></div></div>
          <div class="step"><span class="step-index">02</span><div><h3>Conclui a tua inscrição</h3><p>Serás encaminhado para o checkout seguro da nossa plataforma de pagamentos.</p></div></div>
          <div class="step"><span class="step-index">03</span><div><h3>Começa a preparar-te</h3><p>Acede à tua área de estudante e utiliza as ferramentas incluídas no teu plano.</p></div></div>
        </div>
      </div>
    </section>

    <section class="section pricing-section" id="planos">
      <div class="container">
        <div class="pricing-heading"><div class="eyebrow">ESCOLHE A TUA EXPERIÊNCIA</div><h2>O plano certo para <span>o teu próximo passo.</span></h2><p>Começa a estudar com mais estratégia. Escolhe como queres evoluir.</p></div>
        <div class="pricing-grid">
          <article class="price-card">
            <div class="plan-label">PARA COMEÇAR</div><h3>Starter</h3><p class="plan-description">As ferramentas essenciais para organizares os teus estudos.</p>
            <div class="price"><strong>5.000</strong><span>Kz <small>/ mês</small></span></div>
            <div class="price-divider"></div><p class="included-title">O que está incluído</p>
            <ul class="benefits"><li>${icon('check')} Gerador de planos de estudo</li><li>${icon('check')} Gerador de provas e simulados</li><li>${icon('check')} Assistente académico com IA</li></ul>
            <a class="button button-outline price-button" href="#planos" data-plan="starter">Assinar Starter ${icon('arrow')}</a>
            <p class="checkout-note">Pagamento processado através da Kursinha.</p>
          </article>
          <article class="price-card pro-card">
            <div class="popular-tag">EXPERIÊNCIA COMPLETA</div><div class="plan-label">PARA IR MAIS LONGE</div><h3>Pro</h3><p class="plan-description">Tecnologia, técnicas de estudo e acompanhamento direto.</p>
            <div class="price"><strong>10.000</strong><span>Kz <small>/ mês</small></span></div>
            <div class="price-divider"></div><p class="included-title">Tudo do Starter, mais</p>
            <ul class="benefits"><li>${icon('check')} Livro exclusivo de técnicas de estudo</li><li>${icon('check')} 1 aula ao vivo por semana</li><li>${icon('check')} 4 aulas durante o mês</li><li>${icon('check')} Acompanhamento e orientação</li></ul>
            <a class="button button-primary price-button" href="#planos" data-plan="pro">Escolher Pro ${icon('arrow')}</a>
            <p class="checkout-note">Pagamento processado através da Kursinha.</p>
          </article>
        </div>
        <p class="pricing-footnote">Os planos apresentados são mensais. As condições de acesso e acompanhamento serão apresentadas antes da confirmação da compra.</p>
      </div>
    </section>

    <section class="closing-cta"><div class="container closing-inner"><div><div class="eyebrow">O TEU FUTURO MERECE PREPARAÇÃO</div><h2>Começa hoje. O teu esforço<br><span>merece direção.</span></h2></div><a class="button button-light" href="#planos">Encontrar o meu plano ${icon('arrow')}</a></div></section>
  </main>

  <footer class="site-footer"><div class="container footer-inner"><a class="brand" href="#inicio"><span class="brand-mark">P</span><span>prepara<span class="brand-dot">.</span></span></a><p>Estuda com propósito. Prepara-te para vencer.</p><span>© ${new Date().getFullYear()} Prepara. Todos os direitos reservados.</span></div></footer>
  <div class="toast" role="status" aria-live="polite"></div>
`

const menuButton = document.querySelector('.menu-toggle')
const nav = document.querySelector('.main-nav')
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true'
  menuButton.setAttribute('aria-expanded', String(!open))
  menuButton.innerHTML = icon(open ? 'menu' : 'close')
  nav.classList.toggle('nav-open', !open)
})
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('nav-open')
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.innerHTML = icon('menu')
}))

let toastTimer
function showToast(message) {
  const toast = document.querySelector('.toast')
  toast.textContent = message
  toast.classList.add('toast-visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 4200)
}

document.querySelectorAll('[data-plan]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault()
    const url = checkoutUrls[button.dataset.plan]
    if (url) {
      window.location.assign(url)
    } else {
      showToast('O checkout deste plano será ativado quando configurarmos o link da Kursinha.')
    }
  })
})

async function renderRoute() {
 const route = window.location.hash.replace('#', '')
 if (route === 'entrar' || route === 'criar-conta') await renderAuth(app, route === 'criar-conta' ? 'signup' : 'login')
 else if (route === 'painel') await renderStudentPanel(app)
 else if (!app.querySelector('.site-header')) window.location.reload()
}
window.addEventListener('hashchange', renderRoute)
if (isSupabaseConfigured && supabase) supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT' && window.location.hash === '#painel') window.location.hash = '#entrar' })
if (['#entrar', '#criar-conta', '#painel'].includes(window.location.hash)) renderRoute()
