const { pool } = require("./db");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cadastrarPeca({ tipo, marca, modelo, qualidade, preco, estoque }) {
  const tipoDB = await prisma.tipoProduto.upsert({
    where: { nome: tipo },
    update: {},
    create: { nome: tipo },
  });

  const marcaDB = await prisma.marca.upsert({
    where: { nome: marca },
    update: {},
    create: { nome: marca }
  });

  const modeloDB = await prisma.modelo.upsert({
    where: { nome: modelo },
    update: {},
    create: {
      nome: modelo,
      marcaId: marcaDB.id
    }
  });

  const qualidadeDB = await prisma.qualidade.upsert({
    where: { nome: qualidade },
    update: {},
    create: { nome: qualidade }
  });

  const produto = await prisma.produto.create({
    data: {
      preco,
      estoque,
      tipoId: tipoDB.id,
      modeloId: modeloDB.id,
      qualidadeId: qualidadeDB.id
    }
  });

  return produto;
}

async function buscarProduto(termo = "") {
  try {
    // Se não houver termo, findMany traz tudo. Se houver, ele filtra.
    const produtos = await prisma.produto.findMany({
      where: termo ? {
        OR: [
          { tipo: { nome: { contains: termo, mode: 'insensitive' } } },
          { modelo: { nome: { contains: termo, mode: 'insensitive' } } },
          { modelo: { marca: { nome: { contains: termo, mode: 'insensitive' } } } }
        ]
      } : {},
      include: {
        tipo: true,
        qualidade: true,
        modelo: { include: { marca: true } }
      }
    });
    return produtos;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return [];
  }
}

module.exports = { cadastrarPeca, buscarProduto };