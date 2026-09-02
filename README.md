# WhatsApp E-commerce Assistant Bot

> Bot inteligente para WhatsApp voltado à consulta de estoque, busca de peças e gestão de catálogo de assistência técnica, construído com Node.js, Baileys e PostgreSQL.

---

### Tecnologias Utilizadas

- **Runtime:** Node.js
- **WhatsApp Engine:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) (WebSockets)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Banco de Dados:** PostgreSQL
- **Validação e Parsing:** JavaScript Nativo

---

###  Funcionalidades

- **Atendimento Automatizado:** Resposta contextual a saudações e exibição de menus interativos.
- **Busca Tolerante e Abrangente:** Consulta por peças, modelos e marcas com busca *case-insensitive* direto no banco.
- **Gestão de Catálogo (Admin):** Área administrativa restrita para inserção dinâmica de novos produtos via comandos de texto estruturados.
- **Estrutura Relacional Robusta:** Separação estrita entre Tipos de Produto, Marcas, Modelos e Qualidades.

---

### 📦 Como Executar o Projeto Localmente

#### 1. Clone o repositório:
\`\`\`bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
\`\`\`

#### 2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

#### 3. Configure as variáveis de ambiente:
Duplique o arquivo `.env.example`, renomeie para `.env` e preencha suas credenciais do PostgreSQL:
\`\`\`bash
cp .env.example .env
\`\`\`

#### 4. Prepare o Banco de Dados:
Execute as migrações do Prisma e popule com dados fictícios para teste:
\`\`\`bash
npx prisma migrate dev --name init
npx prisma db seed
\`\`\`

#### 5. Inicie o Bot:
\`\`\`bash
npm start
\`\`\`
> Escaneie o QR Code exibido no terminal com o seu aplicativo do WhatsApp.
