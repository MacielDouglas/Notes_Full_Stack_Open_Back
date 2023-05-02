// o pacote supertest para nos ajudar a escrever os testes para nossa API.
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const Note = require('../models/note');

const initialNotes = [
  {
    content: 'HTML is Easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
];

// inicializar o banco de dados antes de cada teste com a função beforeEach
// O banco de dados é apagado logo no início, após isso salvamos no banco as duas notas armazenadas no array initialNotes. Fazendo isso, garantimos que o banco de dados esteja no mesmo estado antes da execução de cada teste.
beforeEach(async () => {
  await Note.deleteMany({});
  let noteObject = new Note(initialNotes[0]);
  await noteObject.save();
  noteObject = new Note(initialNotes[1]);
  await noteObject.save();
});

// O teste importa a aplicação Express do módulo app.js e o envolve com a função supertest em um objeto chamado superagent. Esse objeto é atribuído à variável api, usada nos testes para fazer requisições HTTP para o backend.

// Nosso teste faz uma requisição HTTP GET na url api/notes e verifica se a requisição é respondida com o código de status 200. O teste também verifica se o cabeçalho Content-Type está configurado como application/json, o que indica que os dados estão no formato desejado.

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  // O valor desejado foi definido por meio de uma expressão regular, ou simplesmente regex.
});

test('there are two notes', async () => {
  const response = await api.get('/api/notes');

  expect(response.body).toHaveLength(2);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');

  expect(response.body[0].content).toBe('HTML is Easy');
});

test('all notes are returned', async () => {
  const response = await api.get('/api/notes');

  expect(response.body).toHaveLength(initialNotes.length);
});

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes');

  // O comando response.body.map(r => r.content)é utilizado para criar um array contendo o que está no content de cada nota retornada pela API. O método toContain é utilizado para checar se a nota passada como parâmetro está na lista de notas retornada pela API.
  const contents = response.body.map((r) => r.content);
  expect(contents).toContain('Browser can execute only JavaScript');
});

// Quando todos os testes terminarem a execução, encerramos a conexão usada pelo Mongoose
afterAll(async () => {
  await mongoose.connection.close();
});

// Outro erro que pode aparecer para você nos seus testes é se a execução deles demorar mais do que 5 segundos (5000ms), que é o tempo padrão do Jest para timeout. Isso pode ser resolvido adicionando um terceiro parâmetro na função test:

// test('notes are returned as json', async () => {
//   await api
//     .get('/api/notes')
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
// }, 100000)
