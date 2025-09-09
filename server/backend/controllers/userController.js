const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, failure } = require('../utils/response');
const paginate = require('../utils/pagination');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return failure(res, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    const token = generateToken(user);
    return success(res, { token, user }, "User registered successfully");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) return failure(res, "Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return failure(res, "Invalid credentials", 401);

    const token = generateToken(user);
    return success(res, { token, user }, "Login successful");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page, size } = req.body;
    const { skip, limit } = paginate(page, size);

    const users = await User.find({ isDeleted: false }).skip(skip).limit(limit);
    return success(res, users, "Users fetched successfully");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { isDeleted: true });
    return success(res, null, "User soft deleted");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { isDeleted: false });
    return success(res, null, "User restored");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};
