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

interface LoginRequest {
  email: string;
  password: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  let client;

  try {
    client = await pool.connect();

    const result = await client.query<{
      email: string;
      password_hash: string;
      must_change_password: boolean;
    }>("SELECT email, password_hash, must_change_password FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      {
        email: user.email,
        mustChangePassword: user.must_change_password,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      token,
      mustChangePassword: user.must_change_password,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication failed" });
  } finally {
    if (client) {
      client.release();
    }
  }
}
