# EMDA Banco de Talentos - PWA

Progressive Web App para coleta de currículos da Escola de Moda Denise Aguiar.

## 📁 Estrutura do Projeto

```
emda-pwa/
├── index.html              # Página principal
├── manifest.json           # Configurações do PWA
├── sw.js                   # Service Worker (offline)
├── css/
│   └── style.css           # Estilos do app
├── js/
│   └── app.js              # Lógica do formulário
├── img/
│   ├── logo-black.png      # Logo original (preta)
│   ├── logo-white.png      # Logo invertida (branca)
│   ├── icon-*.png          # Ícones do PWA (vários tamanhos)
├── SETUP_GOOGLE_SHEETS.md  # Instruções de integração
└── README.md               # Este arquivo
```

## 🚀 Como Publicar

### Opção 1: GitHub Pages (Gratuito)

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Vá em Settings > Pages
4. Selecione a branch `main` e pasta `/ (root)`
5. Acesse em: `https://seuusuario.github.io/emda-talentos/`

### Opção 2: Netlify (Gratuito)

1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta do projeto para fazer deploy
3. Personalize a URL

### Opção 3: Vercel (Gratuito)

1. Acesse [vercel.com](https://vercel.com)
2. Conecte com GitHub ou faça upload direto
3. Deploy automático

### Opção 4: Servidor Próprio

Copie todos os arquivos para a pasta pública do seu servidor web (Apache, Nginx, etc.)

## ⚙️ Configuração

### 1. Google Sheets
Siga as instruções detalhadas em `SETUP_GOOGLE_SHEETS.md`

### 2. Personalização

#### Cores (css/style.css)
```css
:root {
    --color-gold: #C9A962;        /* Cor de destaque */
    --color-gold-dark: #A68B4B;   /* Cor secundária */
    /* ... outras cores ... */
}
```

#### Cursos disponíveis (index.html)
Edite a seção de checkboxes na Etapa 02 do formulário.

## 📱 Recursos PWA

- ✅ Instalável na tela inicial
- ✅ Funciona offline (após primeira visita)
- ✅ Design responsivo (mobile-first)
- ✅ Splash screen personalizada
- ✅ Ícones em vários tamanhos

## 🎨 Design

- Tipografia: Cormorant Garamond + Montserrat
- Paleta: Preto, branco, dourado
- Estilo: Editorial de moda, elegante e minimalista

## 📋 Dados Coletados

| Campo | Obrigatório |
|-------|-------------|
| Foto de perfil | Não |
| Nome completo | Sim |
| E-mail | Sim |
| WhatsApp | Sim |
| Cidade/Estado | Sim |
| Cursos na EMDA | Sim |
| Ano de conclusão | Sim |
| Experiência profissional | Não |
| Instagram | Não |
| Portfólio | Não |
| LinkedIn | Não |
| Sobre você | Não |

## 🔒 Privacidade

- Dados são enviados diretamente para o Google Sheets
- LGPD: Usuário deve aceitar termos antes de enviar
- Foto é enviada como indicador (Sim/Não), não é armazenada

## 📞 Suporte

Escola de Moda Denise Aguiar
- WhatsApp: (31) 99901-6061
- Site: [escolademodadeniseaguiar.com.br](https://escolademodadeniseaguiar.com.br)

---

© 2025 Escola de Moda Denise Aguiar - Todos os direitos reservados
