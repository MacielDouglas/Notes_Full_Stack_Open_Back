const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const Note = require('./models/note');

// Middleware que imprime informações sobre cada requisição enviada ao servidor.
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static('build'));

// let notes = [
//   {
//     id: 1,
//     content: 'HTML is easy',
//     important: true,
//   },
//   {
//     id: 2,
//     content: 'Browser can execute only JavaScript',
//     important: false,
//   },
//   {
//     id: 3,
//     content: 'GET and POST are the most important methods of HTTP protocol',
//     important: true,
//   },
//   {
//     id: 4,
//     content: 'GET and POST are the most important methods of HTTP protocol',
//     important: true,
//   },
//   {
//     id: 5,
//     content:
//       'GET and POST are the most important methods of HTTP protoadfafasfdasdfadsfcol',
//     important: true,
//   },
// ];

// Gerenciador de eventos que lida com requisiçoes HTTP GET

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.post('/api/notes', (request, response) => {
  const body = request.body;

  // a propriedade content não pode estar vazia.
  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' });
  }

  // Os objetos de note são criados com a função construtora Note. A resposta é enviada dentro da função callback para a operação save
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

// Esse app ira gerenciar todas as requisições HTTP GET com parametro id
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

// gerenciador de requisições com um endpoint desconhecido
app.use(unknownEndpoint);

// gerenciador de requisições com um resultado para erros
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
