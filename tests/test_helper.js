const Note = require('../models/note');

// array inicialNotes contendo o estado inicial do banco de dados também está no módulo
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

// futura função noExistingId. que pode ser utilizada para criar um objeto ID de banco de dados que não pertence a nenhum objeto nota no banco de dados
const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' });
  await note.save();
  await note.remove();

  return note._id.toString();
};

// função notesInDb que pode ser utilizada para checar as notas armazenadas no banco de dados.
const notesInDb = async () => {
  const notes = await Note.find({});
  return notes.map((note) => note.toJSON());
};

module.exports = {
  initialNotes,
  nonExistingId,
  notesInDb,
};
