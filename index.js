const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '2108',
    port: 5433,
});

async function conectar() {
    await client.connect();
    console.log('Conectado a PostgreSQL');
}

conectar();

async function buscarProdutos(nome) {
    const resultado = await client.query('SELECT * FROM produtos WHERE nome = $1', [nome]);
    return resultado.rows[0];
}

async function testar() {
    const produto = await buscarProdutos('arroz');
    console.log(produto);
}

testar();