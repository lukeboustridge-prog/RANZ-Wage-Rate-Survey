import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

const JWT_SECRET = process.env.JWT_SECRET || "ranz-survey-secret-key";

interface TokenPayload {
  email: string;
  mustChangePassword: boolean;
}

interface ChangePasswordRequest {
  newPassword: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization required" });
    return;
  }

  const token = authHeader.substring(7);
  let decoded: TokenPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const { newPassword } = req.body as ChangePasswordRequest;

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  let client;

  try {
    client = await pool.connect();

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await client.query(
      "UPDATE users SET password_hash = $1, must_change_password = false WHERE email = $2",
      [passwordHash, decoded.email]
    );

    const newToken = jwt.sign(
      {
        email: decoded.email,
        mustChangePassword: false,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to update password" });
  } finally {
    if (client) {
      client.release();
    }
  }
}
