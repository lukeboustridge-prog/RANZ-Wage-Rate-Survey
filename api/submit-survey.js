import { Client } from "pg";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { company, rates, overtime, mileage, otherBenefits } = req.body;

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
        company?.companyName ?? null,
        company?.ranzMemberNumber ?? null,
        company?.region ?? null,
        company?.totalStaff ? Number(company.totalStaff) : null,
        rates ?? null,
        overtime ?? null,
        mileage ?? null,
        otherBenefits ?? null
      ]
    );

    await client.end();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
}
