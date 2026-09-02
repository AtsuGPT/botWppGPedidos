const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o povoamento do banco de dados...');

  // Limpa registros anteriores para evitar duplicações em testes repetidos
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.modelo.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.tipoProduto.deleteMany();
  await prisma.qualidade.deleteMany();

  // 1. Tipos de Produto
  const tipoTela = await prisma.tipoProduto.create({ data: { nome: 'Tela Frontal' } });
  const tipoBateria = await prisma.tipoProduto.create({ data: { nome: 'Bateria' } });
  const tipoConector = await prisma.tipoProduto.create({ data: { nome: 'Conector de Carga' } });

  // 2. Qualidades
  const qualOriginal = await prisma.qualidade.create({ data: { nome: 'Original Nacional' } });
  const qualOled = await prisma.qualidade.create({ data: { nome: 'OLED Premium' } });
  const qualIncell = await prisma.qualidade.create({ data: { nome: 'Incell' } });

  // 3. Marcas e Modelos
  const apple = await prisma.marca.create({
    data: {
      nome: 'Apple',
      modelos: {
        create: [
          { nome: 'iPhone 11' },
          { nome: 'iPhone 12' },
          { nome: 'iPhone 13' },
          { nome: 'iPhone 14 Pro' }
        ]
      }
    },
    include: { modelos: true }
  });

  const samsung = await prisma.marca.create({
    data: {
      nome: 'Samsung',
      modelos: {
        create: [
          { nome: 'Galaxy S20 FE' },
          { nome: 'Galaxy A32' },
          { nome: 'Galaxy A54' }
        ]
      }
    },
    include: { modelos: true }
  });

  const motorola = await prisma.marca.create({
    data: {
      nome: 'Motorola',
      modelos: {
        create: [
          { nome: 'Moto G60' },
          { nome: 'Moto G22' }
        ]
      }
    },
    include: { modelos: true }
  });

  // Mapeamentos rápidos de IDs
  const modIphone11 = apple.modelos.find(m => m.nome === 'iPhone 11');
  const modIphone13 = apple.modelos.find(m => m.nome === 'iPhone 13');
  const modS20Fe = samsung.modelos.find(m => m.nome === 'Galaxy S20 FE');
  const modA54 = samsung.modelos.find(m => m.nome === 'Galaxy A54');
  const modMotoG60 = motorola.modelos.find(m => m.nome === 'Moto G60');

  // 4. Catálogo de Produtos
  await prisma.produto.createMany({
    data: [
      { tipoId: tipoTela.id, modeloId: modIphone13.id, qualidadeId: qualOled.id, preco: 420.00, estoque: 8 },
      { tipoId: tipoTela.id, modeloId: modIphone13.id, qualidadeId: qualIncell.id, preco: 210.00, estoque: 15 },
      { tipoId: tipoBateria.id, modeloId: modIphone13.id, qualidadeId: qualOriginal.id, preco: 180.00, estoque: 12 },

      { tipoId: tipoTela.id, modeloId: modIphone11.id, qualidadeId: qualIncell.id, preco: 145.00, estoque: 20 },
      { tipoId: tipoBateria.id, modeloId: modIphone11.id, qualidadeId: qualOriginal.id, preco: 130.00, estoque: 9 },

      { tipoId: tipoTela.id, modeloId: modS20Fe.id, qualidadeId: qualOled.id, preco: 310.00, estoque: 6 },
      { tipoId: tipoConector.id, modeloId: modS20Fe.id, qualidadeId: qualOriginal.id, preco: 45.00, estoque: 25 },
      { tipoId: tipoTela.id, modeloId: modA54.id, qualidadeId: qualOled.id, preco: 280.00, estoque: 10 },

      { tipoId: tipoTela.id, modeloId: modMotoG60.id, qualidadeId: qualIncell.id, preco: 120.00, estoque: 14 },
      { tipoId: tipoBateria.id, modeloId: modMotoG60.id, qualidadeId: qualOriginal.id, preco: 85.00, estoque: 7 }
    ]
  });

  console.log('✅ Banco de dados semeado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });