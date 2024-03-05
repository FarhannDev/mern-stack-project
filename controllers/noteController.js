const Note = require('../models/Note');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const notes = await Note.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  if (!notes?.length) {
    return res.status(400).json({ message: 'No notes found' });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      // return { ...note, username: user.username };
      return {
        ...note,
        users: {
          _id: user._id,
          username: user.username,
        },
      };
    })
  );

  return res.status(200).json(notesWithUser);
});

const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();
  duplicate && res.status(409).json({ message: 'Duplicate note title' });

  // Create and store the new user
  const note = await Note.create({ user, title, text });
  note
    ? res.status(201).json({ message: 'New note created' })
    : res.status(400).json({ message: 'Invalid note data received' });
});

const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec();
  !note && res.status(400).json({ message: 'Note not found' });

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();
  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate note title' });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  return res.status(200).json(`'${updatedNote.title}' updated`);
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // confirm data
  if (!id) {
    return res.status(400).json({ message: 'Note ID required' });
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  const result = await note.deleteOne();
  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
