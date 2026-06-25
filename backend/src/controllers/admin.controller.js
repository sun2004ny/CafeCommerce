import {
  loginAdmin,
  getDashboardStats,
  listUsers,
  getUserDetail,
  deleteUser,
} from "../services/admin.service.js";

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const result = loginAdmin(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function adminStats(req, res, next) {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function adminListUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function adminGetUser(req, res, next) {
  try {
    const data = await getUserDetail(req.params.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteUser(req, res, next) {
  try {
    await deleteUser(req.params.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
