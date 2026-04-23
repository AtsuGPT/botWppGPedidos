const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const { buscarProduto, cadastrarPeca } = require("./service.js");

const ADMINS = ["165528073142341@lid"];

function getSenderId(msg) {
  if (!msg || !msg.key) return null;
  return msg.key.participant || msg.key.remoteJid;
}

function isAdmin(msg) {
  const sender = getSenderId(msg);
  if (!sender) return false;
  return ADMINS.includes(sender);
}

function parseCadastro(texto) {
  const semPrefixo = texto.replace("admin add ", "");
  const partes = semPrefixo.split("|").map(p => p.trim());

  return {
    tipo: partes[0],
    marca: partes[1],
    modelo: partes[2],
    qualidade: partes[3],
    preco: parseFloat(partes[4]),
    estoque: parseInt(partes[5])
  };
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
      console.log("QR:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) start();
    }
    if (connection === "open") console.log("✅ WhatsApp conectado");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg || !msg.message || !msg.key) return;

    const texto = msg.message.conversation || msg.message?.extendedTextMessage?.text;
    if (!texto) return;

    const remoteJid = msg.key.remoteJid;

    const gatilhos = ["menu", "opções", "iniciar", "começar", "oi", "olá", "bom dia", "boa tarde", "listar"];

    //mensagem inicial com menu de opções

    if (gatilhos.includes(texto.toLowerCase())) {
      await listarProdutos(remoteJid, sock);
      await sock.sendMessage(remoteJid, { text: "Bem vindos a loja!\n\n✨Digite 'listar' para ver todos os produtos ou 'buscar [termo]' para encontrar algo específico." });
    }
    if (!gatilhos.includes(texto.toLowerCase())) {
      await sock.sendMessage(remoteJid, { text: "Comando não reconhecido. Digite 'menu' para ver as opções." });
    }


    //Comandos - Botões inicias
    const selectionId = msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;
      if (selectionId === "listar") {
        const produtos = await buscarProduto();
        if (produtos.length === 0) {
          await sock.sendMessage(remoteJid, { text: "❌ Nenhum produto encontrado." });
          return;
        }
        let resposta = `📦 *Resultados (${produtos.length}):*\n\n`; //cria a resposta e soma com os dados achados no db //
        produtos.forEach(p => { resposta += `*${p.tipo.nome} ${p.modelo.marca.nome} ${p.modelo.nome}*\n✨ ${p.qualidade.nome} | 💰` });
        await sock.sendMessage(remoteJid, { text: resposta });
      } else if (selectionId === "buscar") {
        await sock.sendMessage(remoteJid, { text: "Digite o nome da peça ou marca que deseja buscar:" });
      }


    // ADMIN CADASTRO
    if (texto.startsWith("admin add")) {
      if (!isAdmin(msg)) {
        await sock.sendMessage(remoteJid, { text: "Acesso negado" });
        return;
      }

      try {
        const dados = parseCadastro(texto);
        const produto = await cadastrarPeca(dados);
        await sock.sendMessage(remoteJid, { text: `✅ Produto cadastrado (ID: ${produto.id})` });
      } catch (err) {
        console.error(err);
        await sock.sendMessage(remoteJid, { text: "Erro ao cadastrar produto" });
      }
      return;
    }

    //BUSCA E LISTAGEM DE PRODUTOS ===== TROCAR PARA UM MENU DE OPÇÕES FUTURAMENTE
    if (texto.toLowerCase().startsWith("lista") || texto.toLowerCase() === "listar") {
      const termo = texto.split(" ").slice(1).join(" ");
      
      const produtos = await buscarProduto(termo);

      if (produtos.length === 0) {
        await sock.sendMessage(remoteJid, { text: "❌ Nenhum produto encontrado." });
        return;
      }

      let resposta = `📦 *Resultados (${produtos.length}):*\n\n`;
      
      produtos.forEach(p => {
        resposta += `*${p.tipo.nome} ${p.modelo.marca.nome} ${p.modelo.nome}*\n`;
        resposta += `✨ ${p.qualidade.nome} | 💰 R$${p.preco.toFixed(2)}\n`;
        resposta += `🔢 Estoque: ${p.estoque} un\n`;
        resposta += `----------------------------\n`;
      });

      await sock.sendMessage(remoteJid, { text: resposta });
    }
  });
}

start();