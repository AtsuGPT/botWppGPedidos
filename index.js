const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscarProdutos(termo) {
  const resultados = await prisma.produto.findMany({
    where: {
      OR: [
        { tipo: { nome: { contains: termo, mode: 'insensitive' } } },
        { modelo: { nome: { contains: termo, mode: 'insensitive' } } },
        { modelo: { marca: { nome: { contains: termo, mode: 'insensitive' } } } },
      ],
    },
    include: {
      tipo: true,
      modelo: {
        include: {
          marca: true,
        },
      },
      qualidade: true,
    },
  });

  return resultados;
}

async function testar() {
  try {
    console.log('Conectando ao banco via Prisma...');
    const produtos = await buscarProdutos('tela');
    console.log('Produtos encontrados:', JSON.stringify(produtos, null, 2));
  } catch (error) {
    console.error('Erro na consulta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testar();