import { Pool } from "pg";
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

function verifyToken(req: VercelRequest): TokenPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded.mustChangePassword) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: "Authorization required" });
    return;
  }

  let client;

  try {
    client = await pool.connect();

    // If stats query param is present, return just the counts
    if (req.query.stats === "true") {
      const submissionsResult = await client.query<{ count: string }>(
        "SELECT COUNT(*) as count FROM survey_submissions"
      );
      const ratesResult = await client.query<{ count: string }>(
        "SELECT COUNT(*) as count FROM survey_rates"
      );

      res.status(200).json({
        totalSubmissions: parseInt(submissionsResult.rows[0].count, 10),
        totalRates: parseInt(ratesResult.rows[0].count, 10),
      });
      return;
    }

    // Otherwise, export full CSV
    const result = await client.query(`
      SELECT
        s.id as submission_id,
        s.company_name,
        s.ranz_member_number,
        s.region,
        s.total_staff,
        s.is_lbp,
        s.overtime,
        s.mileage,
        s.other_benefits,
        s.created_at,
        r.role_key,
        r.band_key,
        r.hourly_rate,
        r.charge_out_rate
      FROM survey_submissions s
      LEFT JOIN survey_rates r ON s.id = r.submission_id
      ORDER BY s.id, r.role_key, r.band_key
    `);

    const headers = [
      "submission_id",
      "company_name",
      "ranz_member_number",
      "region",
      "total_staff",
      "is_lbp",
      "overtime",
      "mileage",
      "other_benefits",
      "created_at",
      "role_key",
      "band_key",
      "hourly_rate",
      "charge_out_rate",
    ];

    const csvRows = [headers.join(",")];

    for (const row of result.rows) {
      const values = headers.map((header) => {
        let value = row[header];
        // Handle JSON columns
        if (header === "overtime" || header === "mileage") {
          value = value ? JSON.stringify(value) : "";
        }
        return escapeCSV(value);
      });
      csvRows.push(values.join(","));
    }

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ranz-survey-export.csv"`
    );
    res.status(200).send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Export failed" });
  } finally {
    if (client) {
      client.release();
    }
  }
}
