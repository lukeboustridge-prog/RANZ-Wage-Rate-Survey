import { VercelRequest, VercelResponse } from "@vercel/node";
import { Client } from "pg";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      company,
      rates,
      overtime,
      mileage,
      otherBenefits
    } = req.body;

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    await client.query(
      `INSERT INTO ranz_wage_survey 
       (company_name, ranz_member_number, region, total_staff, rates, overtime, mileage, other_benefits)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        company.companyName,
        company.ranzMemberNumber,
        company.region,
        company.totalStaff ? Number(company.totalStaff) : null,
        rates,
        overtime,
        mileage,
        otherBenefits
      ]
    );

    await client.end();

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Submit error:", err);
    return res.status(500).json({ error: "Database insert failed", detail: err.message });
  }
}
