# Prepara

Plataforma de preparação académica com ferramentas de estudo apoiadas por IA, pensada para estudantes em Angola.

## Stack inicial
- Vite + JavaScript
- CSS responsivo
- Supabase (a integrar)
- Gemini API via backend seguro (a integrar)
- Kursinha para checkout (a configurar)

## Executar localmente
```bash
npm install
npm run dev
```

## Build de produção
```bash
npm run build
npm run preview
```

## Links de checkout
Cria um ficheiro `.env.local` com os links oficiais de checkout fornecidos pela Kursinha:

```env
VITE_KURSINHA_STARTER_URL=
VITE_KURSINHA_PRO_URL=
```

Não coloques chaves secretas de APIs no frontend. A integração Gemini deverá ser feita através de uma função backend segura.

## Estado atual
- [x] Landing page pública
- [x] Apresentação de funcionalidades
- [x] Planos Starter e Pro
- [x] Botões preparados para redirecionamento Kursinha
- [ ] Autenticação e base de dados Supabase
- [ ] Dashboard do estudante
- [ ] Integração Gemini segura
- [ ] Confirmação de pagamentos e permissões
