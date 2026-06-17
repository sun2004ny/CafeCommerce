import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
} from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await registerUser(name.trim(), email.toLowerCase().trim(), password);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await loginUser(email.toLowerCase().trim(), password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (password) updates.password = password;

    const user = await updateUserProfile(req.user.userId, updates);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
