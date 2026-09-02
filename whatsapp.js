const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const { buscarProduto, cadastrarPeca } = require("./service.js"); //aqui usamos baileys como cliente do wpp uma vez que nao temos uma api oficial do wpp para cadastro de produtos, e usamos o prisma para manipular o banco de dados

const ADMINS = ["165528073142341@lid"];

function getSenderId(msg) { //verifica se a mensagem é de um grupo (participant) ou de um chat privado (remoteJid)
  if (!msg || !msg.key) return null;
  return msg.key.participant || msg.key.remoteJid;
}

function isAdmin(msg) {
  const sender = getSenderId(msg);//verifica se o remetente é um adm
  if (!sender) return false; 
  return ADMINS.includes(sender);
}

function parseCadastro(texto) { //função para parsear o texto do comando de cadastro
  const semPrefixo = texto.substring(10).trim();
  const partes = semPrefixo.split("|").map(p => p.trim());

  if (partes.length < 6) throw new Error("Faltam parâmetros para o cadastro.");

  return {
    tipo: partes[0],
    marca: partes[1],
    modelo: partes[2],
    qualidade: partes[3],
    preco: parseFloat(partes[4]),
    estoque: parseInt(partes[5])
  };
}

function getMessageText(msg) {
  return msg.message?.conversation || 
         msg.message?.extendedTextMessage?.text || 
         msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || 
         "";
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    browser: ["Ubuntu", "Chrome", "22.04"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("QR Code atualizado:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Conexão fechada. Reconectando:", shouldReconnect);
      if (shouldReconnect) start();
    }
    if (connection === "open") console.log("✅ WhatsApp conectado");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg || !msg.message || !msg.key || msg.key.fromMe) return;

    const textoBase = getMessageText(msg);
    if (!textoBase) return;

    const texto = textoBase.toLowerCase().trim();
    const remoteJid = msg.key.remoteJid;

    // comandos de Admin
    if (texto.startsWith("admin add")) {
      if (!isAdmin(msg)) {
        await sock.sendMessage(remoteJid, { text: "❌ Acesso negado." });
        return;
      }

      try {
        const dados = parseCadastro(textoBase);
        const produto = await cadastrarPeca(dados);
        await sock.sendMessage(remoteJid, { text: `✅ Produto cadastrado (ID: ${produto.id})` });
      } catch (err) {
        console.error("Erro no cadastro:", err);
        await sock.sendMessage(remoteJid, { text: "❌ Erro ao cadastrar produto. Formato esperado: admin add Tipo | Marca | Modelo | Qualidade | Preço | Estoque" });
      }
      return;
    }
    //listar Produtos
    if (texto === "listar") {
      try {
        const produtos = await buscarProduto();
        if (!produtos || produtos.length === 0) {
          await sock.sendMessage(remoteJid, { text: "❌ Nenhum produto encontrado no estoque no momento." });
          return;
        }

        let resposta = `📦 *Resultados (${produtos.length}):*\n\n`;
        produtos.forEach(p => { 
          resposta += `*${p.tipo.nome} ${p.modelo.marca.nome} ${p.modelo.nome}*\n✨ ${p.qualidade.nome} | 💰 R$ ${p.preco.toFixed(2)}\n\n`; 
        });
        
        await sock.sendMessage(remoteJid, { text: resposta.trim() });
      } catch (error) {
        console.error("Erro ao listar:", error);
        await sock.sendMessage(remoteJid, { text: "❌ Ocorreu um erro ao buscar os produtos." });
      }
      return;
    }

    //buscar específico
    if (texto.startsWith("buscar")) {
      const termo = texto.replace("buscar", "").trim();

      if (!termo) {
        await sock.sendMessage(remoteJid, { 
          text: "🔎 Digite o nome da peça ou marca que deseja buscar (Ex: *buscar tela iphone*)." 
        });
        return;
      }

      try {
        const produtos = await buscarProdutoPorTermo(termo);

        if (!produtos || produtos.length === 0) {
          await sock.sendMessage(remoteJid, { 
            text: `❌ Nenhum produto encontrado para: *${termo}*` 
          });
          return;
        }

        let resposta = `🔎 *Resultados para "${termo}" (${produtos.length}):*\n\n`;
        produtos.forEach((p) => {
          resposta += `📦 *${p.tipo.nome} ${p.modelo.marca.nome} ${p.modelo.nome}*\n✨ Qualidade: ${p.qualidade.nome}\n💰 R$ ${Number(p.preco).toFixed(2)}\n📦 Estoque: ${p.estoque} un.\n\n`;
        });

        await sock.sendMessage(remoteJid, { text: resposta.trim() });
      } catch (err) {
        console.error("Erro ao buscar produto:", err);
        await sock.sendMessage(remoteJid, { 
          text: "❌ Ocorreu um erro ao consultar o estoque. Tente novamente mais tarde." 
        });
      }
      return;
    }

    const gatilhos = ["menu", "opções", "iniciar", "começar", "oi", "olá", "bom dia", "boa tarde"];
    if (gatilhos.includes(texto)) {
      await sock.sendMessage(remoteJid, { text: "Bem-vindo à loja!\n\n✨ Digite *listar* para ver todos os produtos ou *buscar [termo]* para encontrar algo específico." });
      return;
    }

    await sock.sendMessage(remoteJid, { text: "Desculpe, não entendi. Digite *menu* para ver as opções." });
  });
}

start();