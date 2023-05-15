// o pacote supertest para nos ajudar a escrever os testes para nossa API.
const bcrypt = require('bcrypt');
const User = require('../models/user');

const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Note = require('../models/note');

// função beforeEach que configura os testes
beforeEach(async () => {
  await Note.deleteMany({});
  await Note.insertMany(helper.initialNotes);
});

// O teste importa a aplicação Express do módulo app.js e o envolve com a função supertest em um objeto chamado superagent. Esse objeto é atribuído à variável api, usada nos testes para fazer requisições HTTP para o backend.

// Nosso teste faz uma requisição HTTP GET na url api/notes e verifica se a requisição é respondida com o código de status 200. O teste também verifica se o cabeçalho Content-Type está configurado como application/json, o que indica que os dados estão no formato desejado.

describe('when there is initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    // O valor desejado foi definido por meio de uma expressão regular, ou simplesmente regex.
  });

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes');

    expect(response.body).toHaveLength(helper.initialNotes.length);
  });

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');

    // O comando response.body.map(r => r.content)é utilizado para criar um array contendo o que está no content de cada nota retornada pela API. O método toContain é utilizado para checar se a nota passada como parâmetro está na lista de notas retornada pela API.

    const contents = response.body.map((r) => r.content);

    expect(contents).toContain('Browser can execute only JavaScript');
  });
});

describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb();

    const noteToView = notesAtStart[0];

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(resultNote.body).toEqual(noteToView);
  });

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId();

    console.log(validNonexistingId);

    await api.get(`/api/notes/${validNonexistingId}`).expect(404);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445';

    await api.get(`/api/notes/${invalidId}`).expect(400);
  }, 100000);
});

describe('addition of a new note', () => {
  test('succeeds with valid data', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    };

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).toContain('async/await simplifies making async calls');
  });

  test('fails with status code 400 if data invalid', async () => {
    const newNote = {
      important: true,
    };

    await api.post('/api/notes').send(newNote).expect(400);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });
});

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

    const contents = notesAtEnd.map((r) => r.content);

    expect(contents).not.toContain(noteToDelete.content);
  });
});

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  // verifique se um novo usuário com o mesmo nome de usuário não pode ser criado
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('expected `username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

// // teste que adiciona uma nova nota e verifica que se o número de notas retornadas pela API aumenta e se a nova nota adicionada está na lista.
// test('a valid note can be added ', async () => {
//   const newNote = {
//     content: 'async/await simplifies making async calls',
//     important: true,
//   };

//   await api
//     .post('/api/notes')
//     .send(newNote)
//     .expect(201)
//     .expect('Content-Type', /application\/json/);

//   const notesAtEnd = await helper.notesInDb();
//   expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

//   const contents = notesAtEnd.map((n) => n.content);
//   expect(contents).toContain('async/await simplifies making async calls');
// });

// // teste que verifica que uma nota sem conteúdo não será salva no banco de dados
// test('note without content is not added', async () => {
//   const newNote = {
//     important: true,
//   };

//   await api.post('/api/notes').send(newNote).expect(400);

//   const notesAtEnd = await helper.notesInDb();

//   expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
// });

// // buscar uma nota individual
// test('a specific note can be viewed', async () => {
//   const notesAtStart = await helper.notesInDb();

//   const noteToView = notesAtStart[0];

//   const resultNote = await api
//     .get(`/api/notes/${noteToView.id}`)
//     .expect(200)
//     .expect('Content-Type', /application\/json/);

//   expect(resultNote.body).toEqual(noteToView);
// });

// // apagar uma nota individual
// test('a note can be deleted', async () => {
//   const notesAtStart = await helper.notesInDb();
//   const noteToDelete = notesAtStart[0];

//   await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

//   const notesAtEnd = await helper.notesInDb();

//   expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

//   const contents = notesAtEnd.map((r) => r.content);

//   expect(contents).not.toContain(noteToDelete.content);
// });

// // Quando todos os testes terminarem a execução, encerramos a conexão usada pelo Mongoose
// afterAll(async () => {
//   await mongoose.connection.close();
// });

// // Outro erro que pode aparecer para você nos seus testes é se a execução deles demorar mais do que 5 segundos (5000ms), que é o tempo padrão do Jest para timeout. Isso pode ser resolvido adicionando um terceiro parâmetro na função test:

// // test('notes are returned as json', async () => {
// //   await api
// //     .get('/api/notes')
// //     .expect(200)
// //     .expect('Content-Type', /application\/json/)
// // }, 100000)
