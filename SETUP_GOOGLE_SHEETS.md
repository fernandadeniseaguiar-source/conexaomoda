# EMDA Conexão Moda - Configuração Google Sheets

## Passo a Passo para Configurar a Integração com Google Sheets

### 1. Criar a Planilha

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha chamada "EMDA - Conexão Moda"
3. Na primeira linha, adicione os cabeçalhos (exatamente como abaixo):

```
A1: Timestamp
B1: Nome
C1: Email
D1: WhatsApp
E1: Cidade
F1: Estado
G1: Cursos
H1: Ano de Conclusão
I1: Experiência
J1: Instagram
K1: Portfólio
L1: LinkedIn
M1: Sobre
N1: Tem Foto
```

### 2. Criar o Google Apps Script

1. Na planilha, vá em **Extensões > Apps Script**
2. Delete todo o código existente
3. Cole o código abaixo:

```javascript
// ========================================
// EMDA Conexão Moda - Google Apps Script
// ========================================

// ID da planilha (pegue da URL da sua planilha)
// Exemplo: https://docs.google.com/spreadsheets/d/ESTE_É_O_ID/edit
const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI';
const SHEET_NAME = 'Respostas'; // Nome da aba

function doPost(e) {
  try {
    // Parse dos dados recebidos
    const data = JSON.parse(e.postData.contents);
    
    // Abrir planilha
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Criar aba se não existir
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Adicionar cabeçalhos
      sheet.appendRow([
        'Timestamp',
        'Nome',
        'Email',
        'WhatsApp',
        'Cidade',
        'Estado',
        'Cursos',
        'Ano de Conclusão',
        'Experiência',
        'Instagram',
        'Portfólio',
        'LinkedIn',
        'Sobre',
        'Tem Foto'
      ]);
    }
    
    // Formatar timestamp
    const timestamp = new Date(data.timestamp).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
    
    // Adicionar linha com os dados
    sheet.appendRow([
      timestamp,
      data.nome || '',
      data.email || '',
      data.whatsapp || '',
      data.cidade || '',
      data.estado || '',
      data.cursos || '',
      data.ano_conclusao || '',
      data.experiencia || '',
      data.instagram || '',
      data.portfolio || '',
      data.linkedin || '',
      data.sobre || '',
      data.foto || 'Não'
    ]);
    
    // Retornar sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Dados salvos com sucesso!' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar erro
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função de teste
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        nome: "Teste da Silva",
        email: "teste@email.com",
        whatsapp: "(31) 99999-9999",
        cidade: "Belo Horizonte",
        estado: "MG",
        cursos: "Design de Moda, Fashion Business",
        ano_conclusao: "2024",
        experiencia: "5 anos de experiência em moda",
        instagram: "@teste.moda",
        portfolio: "https://behance.net/teste",
        linkedin: "https://linkedin.com/in/teste",
        sobre: "Apaixonada por moda sustentável",
        foto: "Sim"
      })
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

### 3. Configurar o Script

1. No código acima, substitua `'SEU_SPREADSHEET_ID_AQUI'` pelo ID da sua planilha
   - O ID está na URL da planilha, entre `/d/` e `/edit`
   - Exemplo: `https://docs.google.com/spreadsheets/d/1ABC123xyz/edit` → ID é `1ABC123xyz`

2. Clique em **Salvar** (ícone de disquete ou Ctrl+S)

### 4. Publicar como Web App

1. Clique em **Implantar > Nova implantação**
2. Clique no ícone de engrenagem e selecione **App da Web**
3. Configure:
   - **Descrição**: EMDA Conexão Moda
   - **Executar como**: Eu mesmo
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em **Implantar**
5. Autorize o acesso quando solicitado
6. **COPIE A URL** fornecida - ela será algo como:
   `https://script.google.com/macros/s/XXXXXXX/exec`

### 5. Configurar no PWA

1. Abra o arquivo `js/app.js`
2. Encontre a linha:
   ```javascript
   GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
   ```
3. Substitua `'YOUR_GOOGLE_APPS_SCRIPT_URL'` pela URL copiada no passo anterior

### 6. Testar

1. Abra o PWA no navegador
2. Preencha o formulário com dados de teste
3. Envie e verifique se apareceu na planilha

---

## Estrutura da Planilha

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| A | Timestamp | Data e hora do envio |
| B | Nome | Nome completo do candidato |
| C | Email | E-mail de contato |
| D | WhatsApp | Número de WhatsApp |
| E | Cidade | Cidade onde mora |
| F | Estado | UF |
| G | Cursos | Cursos realizados na EMDA |
| H | Ano de Conclusão | Ano em que concluiu |
| I | Experiência | Descrição da experiência profissional |
| J | Instagram | Perfil profissional |
| K | Portfólio | Link do portfólio |
| L | LinkedIn | Perfil LinkedIn |
| M | Sobre | Texto livre sobre o candidato |
| N | Tem Foto | Se enviou foto (Sim/Não) |

---

## Dicas

- **Formatação**: Você pode formatar a planilha como quiser após a configuração
- **Filtros**: Use filtros para buscar candidatos por curso, ano, cidade, etc.
- **Notificações**: Configure notificações por email quando uma nova linha for adicionada
- **Backup**: A planilha é automaticamente salva no Google Drive

## Suporte

Em caso de dúvidas, verifique:
1. Se a URL do script está correta no `app.js`
2. Se o script foi publicado como "Qualquer pessoa"
3. Se os cabeçalhos da planilha estão corretos
