import { verifyAdminToken } from "../services/admin.service.js";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  try {
    const token = header.slice(7);
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Admin session expired or invalid" });
  }
}
