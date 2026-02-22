import { Pool, PoolClient } from "pg";
import type { VercelRequest, VercelResponse } from "@vercel/node";

interface RateEntry {
  hourlyRate?: string;
  chargeOutRate?: string;
}

interface CompanyInfo {
  companyName?: string;
  ranzMemberNumber?: string;
  region?: string;
  totalStaff?: string;
  isLbp?: boolean;
}

interface OvertimeSettings {
  hoursBeforeOvertime?: string;
  overtimeMultiplier?: string;
  notes?: string;
}

interface MileageSettings {
  perKmRate?: string;
  flatDailyRate?: string;
  notes?: string;
}

interface SurveyPayload {
  company?: CompanyInfo;
  rates?: Record<string, Record<string, RateEntry>>;
  overtime?: OvertimeSettings;
  mileage?: MileageSettings;
  otherBenefits?: string;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let client: PoolClient | null = null;

  try {
    const { company, rates, overtime, mileage, otherBenefits } =
      req.body as SurveyPayload;

    client = await pool.connect();

    await client.query("BEGIN");

    const submissionResult = await client.query<{ id: number }>(
      `INSERT INTO survey_submissions
       (company_name, ranz_member_number, region, total_staff, is_lbp, overtime, mileage, other_benefits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        company?.companyName ?? null,
        company?.ranzMemberNumber ?? null,
        company?.region ?? null,
        company?.totalStaff ? Number(company.totalStaff) : null,
        company?.isLbp ?? false,
        overtime ?? null,
        mileage ?? null,
        otherBenefits ?? null,
      ]
    );

    const submissionId = submissionResult.rows[0].id;

    if (rates) {
      for (const [roleKey, bands] of Object.entries(rates)) {
        for (const [bandKey, entry] of Object.entries(bands)) {
          const hourlyRate = entry.hourlyRate
            ? parseFloat(entry.hourlyRate)
            : null;
          const chargeOutRate = entry.chargeOutRate
            ? parseFloat(entry.chargeOutRate)
            : null;

          if (hourlyRate !== null || chargeOutRate !== null) {
            await client.query(
              `INSERT INTO survey_rates
               (submission_id, role_key, band_key, hourly_rate, charge_out_rate)
               VALUES ($1, $2, $3, $4, $5)`,
              [submissionId, roleKey, bandKey, hourlyRate, chargeOutRate]
            );
          }
        }
      }
    }

    await client.query("COMMIT");

    res.status(200).json({ success: true, submissionId });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Submit error:", err);
    res.status(500).json({ error: "Database insert failed" });
  } finally {
    if (client) {
      client.release();
    }
  }
}
