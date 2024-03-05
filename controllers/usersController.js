const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// Get all users from MongoDB
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  if (!users?.length) {
    return res.status(200).json({ message: 'No users found' });
  }

  return res.status(200).json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'User ID Required' });
  }

  const user = await User.findById(id).select('-password').lean().exec();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json(user);
});

const createNewUsers = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec();
  duplicate && res.status(409).json({ message: 'Duplicate username' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUserObj = { username, password: passwordHash, roles };
  const user = await User.create(newUserObj);
  user
    ? res.status(201).json({ message: `New user ${username} created` })
    : res.status(400).json({ message: 'Invalid user data received' });
});

const updateUsers = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    return res
      .status(400)
      .json({ message: 'All fields except password are required' });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();
  !user && res.status(400).json({ message: 'User not found' });
  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec();
  duplicate &&
    duplicate?._id.toString() !== id &&
    res.status(409).json({ message: 'Duplicate username' });

  user.username = username;
  user.roles = roles;
  user.active = active;
  password && (user.password = await bcrypt.hash(password, 10));

  const updatedUser = await user.save();
  return res.status(200).json({ message: `${updatedUser.username} updated` });
});

const deleteUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Confirm data
  if (!id) {
    return res.status(400).json({ message: 'User ID Required' });
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) return res.status(400).json({ message: 'User has assigned notes' });
  // Does the user exist to delete?
  const user = await User.findById(id).exec();
  if (!user) return res.status(404).json({ message: 'User not found' });

  await user.deleteOne();

  const reply = `Username ${user.username} with ID ${user._id} deleted`;
  return res.status(200).json(reply);
});

module.exports = {
  getAllUsers,
  getUser,
  createNewUsers,
  updateUsers,
  deleteUsers,
};
