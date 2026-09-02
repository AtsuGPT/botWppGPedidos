# WhatsApp E-commerce Assistant Bot

> Bot inteligente para WhatsApp voltado à consulta de estoque, busca de peças e gestão de catálogo de assistência técnica, construído com Node.js, Baileys e PostgreSQL.


---

### Tecnologias Utilizadas

- **Runtime:** Node.js
- **WhatsApp Engine:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) (WebSockets)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Banco de Dados:** PostgreSQL
- **Validação e Parsing:** JavaScript Nativo

### Decisões de Arquitetura

#### Por que Baileys?
Para a camada de comunicação com o WhatsApp, a escolha pelo **Baileys** foi orientada pelo contexto do projeto (MVP / Automação Pessoal):

* **Aceleração e Custo Zero:** Conexão direta via WebSockets simulando o protocolo multi-dispositivo (WhatsApp Web), permitindo validação rápida da ideia sem burocracia de aprovação de contas de negócios ou custos por mensagem/janela de conversa cobrados pela Meta.
* **Flexibilidade de Desenvolvimento:** Acesso de baixo nível a eventos crus de mensagens, status de conexão e suporte a testes locais imediatos com qualquer número de celular.
* **Baileys vs. API Oficial (WhatsApp Cloud API):** 
  Enquanto a Cloud API oficial da Meta é voltada para operações corporativas de larga escala — exigindo verificação de empresa, webhooks públicos e cobrança por conversação iniciada —, o Baileys oferece agilidade cirúrgica para protótipos, ferramentas internas e estudos de caso. A arquitetura deste projeto foi isolada em uma camada de serviço (`service.js`), permitindo que o provedor de mensageria seja substituído pela API Oficial no futuro sem necessidade de reescrever as regras de negócio. Porém baileys viola termos de segurança e serviço da meta, portanto, chance de banimento alta e não é ideal ser aplicada em uma situação real.

#### Por que Prisma ORM?
A escolha do **Prisma** como ponte com o PostgreSQL trouxe robustez e manutenibilidade ao catálogo:

* **Modelagem Declarativa:** O `schema.prisma` atua como uma fonte única de verdade (Single Source of Truth) para o banco relacional, tornando relacionamentos complexos (marcas, modelos e produtos) explícitos e auditáveis.
* **Consultas Tipadas e Seguras:** Redução drástica de erros em tempo de execução ao eliminar queries SQL puras em strings vulneráveis a erros de digitação ou injeção.
* **Produtividade em Migrations e Seed:** Automação completa do ciclo de vida do banco com migrações versionadas e scripts de povoamento (`db seed`) integrados, permitindo que qualquer desenvolvedor clone o repositório e suba o ambiente com poucos comandos.

---

###  Funcionalidades

- **Atendimento Automatizado:** Resposta contextual a saudações e exibição de menus interativos.
- **Busca Tolerante e Abrangente:** Consulta por peças, modelos e marcas com busca *case-insensitive* direto no banco.
- **Gestão de Catálogo (Admin):** Área administrativa restrita para inserção dinâmica de novos produtos via comandos de texto estruturados.
- **Estrutura Relacional Robusta:** Separação estrita entre Tipos de Produto, Marcas, Modelos e Qualidades.
- **Reutlizavel:** Pode gerenciar pedidos de diversos tipos de serviços, lojas com propositos dstintos.

---

### Demonstração

<img width="739" height="1600" alt="image" src="https://github.com/user-attachments/assets/75eed194-9d75-485e-9a67-a7c950600c47" />

---

### Como Executar o Projeto Localmente

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
