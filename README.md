# Prepara

Plataforma de preparação académica com ferramentas de estudo apoiadas por IA, pensada para estudantes em Angola.

## Stack
- Vite + JavaScript
- Supabase Auth e PostgreSQL
- Gemini API (integração backend por implementar)
- Kursinha para checkout (links e confirmação automática por integrar)

## Executar localmente
```bash
npm install
npm run dev
```

## Configurar o Supabase
1. Cria um projeto em Supabase.
2. No SQL Editor do Supabase, executa o conteúdo de `supabase/schema.sql`.
3. Em Project Settings → API, copia o Project URL e a chave publishable/anon.
4. Cria um ficheiro `.env.local` na raiz com:

```env
VITE_SUPABASE_URL=https://TEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=TUA_CHAVE_PUBLICA
VITE_KURSINHA_STARTER_URL=
VITE_KURSINHA_PRO_URL=
```

5. No Supabase → Authentication → URL Configuration, define o Site URL como o domínio publicado e adiciona também o URL de desenvolvimento local, se necessário.
6. No Vercel, adiciona as mesmas variáveis em Project Settings → Environment Variables e faz novo deploy.

A chave anon/publishable é própria para uso no browser com RLS ativo. Nunca coloques a chave `service_role`, passwords ou chaves privadas no frontend.

## Autenticação já implementada
- Registo com nome, e-mail e palavra-passe.
- Login e persistência de sessão.
- Confirmação de e-mail, se estiver ativada no Supabase.
- Área inicial do estudante.
- Consulta da subscrição ativa (quando o pagamento for confirmado pelo backend).

## Segurança de pagamentos
A tabela de subscrições não permite que o utilizador crie ou ative o seu próprio plano. A ativação deverá acontecer num webhook/endpoint backend depois de validar a confirmação de pagamento da Kursinha. Não confiar apenas no redireccionamento de regresso do checkout.

## Build
```bash
npm run build
npm run preview
```

## Estado do projeto
- [x] Landing page responsiva
- [x] Planos Starter e Pro
- [x] Botões preparados para checkout Kursinha
- [x] Cliente Supabase
- [x] Registo e login
- [x] Perfil automático no registo
- [x] Estrutura inicial de subscrições com RLS
- [x] Área inicial do estudante
- [ ] Integração real de checkout e confirmação Kursinha
- [ ] Dashboard com ferramentas de estudo
- [ ] Integração Gemini através de backend seguro
