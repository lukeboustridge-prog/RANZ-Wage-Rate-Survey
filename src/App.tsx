import React, { useState } from "react";

type ExperienceBand = "1_year" | "3_years" | "6_years" | "8_plus" | "apprentice_1" | "apprentice_2" | "apprentice_3" | "apprentice_4";

type RoleKey =
  | "qualified_residential"
  | "qualified_commercial"
  | "membrane_specialist"
  | "foreman"
  | "labourer"
  | "apprentice"
  | "estimator"
  | "project_manager"
  | "admin"
  | "subcontractor";

interface RoleDefinition {
  key: RoleKey;
  label: string;
  bands: ExperienceBand[];
}

const ROLE_DEFS: RoleDefinition[] = [
  {
    key: "qualified_residential",
    label: "Qualified Roofer – Residential / Re-roof",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "qualified_commercial",
    label: "Qualified Roofer – Commercial / Industrial",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "membrane_specialist",
    label: "Membrane / Flat Roof Specialist",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "foreman",
    label: "Roofing Foreman / Site Supervisor",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "labourer",
    label: "Roofing Labourer / Hammer Hand",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "apprentice",
    label: "Roofing Apprentice",
    bands: ["apprentice_1", "apprentice_2", "apprentice_3", "apprentice_4"],
  },
  {
    key: "estimator",
    label: "Estimator / Quantity Surveyor – Roofing",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "project_manager",
    label: "Project Manager – Roofing",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "admin",
    label: "Admin / Office Support",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "subcontractor",
    label: "Subcontract Roofer (per hour)",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
];

const BAND_LABELS: Record<ExperienceBand, string> = {
  "1_year": "1 year",
  "3_years": "3 years",
  "6_years": "6 years",
  "8_plus": "8 years +",
  "apprentice_1": "Year 1 apprentice",
  "apprentice_2": "Year 2 apprentice",
  "apprentice_3": "Year 3 apprentice",
  "apprentice_4": "Year 4 apprentice",
};

interface RateEntry {
  hourlyRate?: string;
  chargeOutRate?: string;
}

type RateState = {
  [R in RoleKey]: {
    [B in ExperienceBand]?: RateEntry;
  };
};

interface OvertimeSettings {
  hoursBeforeOvertime: string;
  overtimeMultiplier: string; // like 1.5, 2.0
  notes: string;
}

interface MileageSettings {
  perKmRate: string;
  flatDailyRate: string;
  notes: string;
}

interface CompanyInfo {
  companyName: string;
  ranzMemberNumber: string;
  region: string;
  totalStaff: string;
}

interface SurveyState {
  company: CompanyInfo;
  rates: RateState;
  overtime: OvertimeSettings;
  mileage: MileageSettings;
  otherBenefits: string;
}

const emptySurvey: SurveyState = {
  company: {
    companyName: "",
    ranzMemberNumber: "",
    region: "",
    totalStaff: "",
  },
  rates: {} as RateState,
  overtime: {
    hoursBeforeOvertime: "",
    overtimeMultiplier: "",
    notes: "",
  },
  mileage: {
    perKmRate: "",
    flatDailyRate: "",
    notes: "",
  },
  otherBenefits: "",
};

const App: React.FC = () => {
  const [survey, setSurvey] = useState<SurveyState>(emptySurvey);
  const [showJson, setShowJson] = useState(false);

  const updateCompany = (field: keyof CompanyInfo, value: string) => {
    setSurvey((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value,
      },
    }));
  };

  const updateRate = (
    roleKey: RoleKey,
    band: ExperienceBand,
    field: keyof RateEntry,
    value: string
  ) => {
    setSurvey((prev) => {
      const roleRates = prev.rates[roleKey] || {};
      const bandEntry = roleRates[band] || {};
      return {
        ...prev,
        rates: {
          ...prev.rates,
          [roleKey]: {
            ...roleRates,
            [band]: {
              ...bandEntry,
              [field]: value,
            },
          },
        },
      };
    });
  };

  const updateOvertime = (field: keyof OvertimeSettings, value: string) => {
    setSurvey((prev) => ({
      ...prev,
      overtime: {
        ...prev.overtime,
        [field]: value,
      },
    }));
  };

  const updateMileage = (field: keyof MileageSettings, value: string) => {
    setSurvey((prev) => ({
      ...prev,
      mileage: {
        ...prev.mileage,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // At this point you can POST `survey` to your API
    setShowJson(true);
  };

  const handleReset = () => {
    setSurvey(emptySurvey);
    setShowJson(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Replace this with actual RANZ logo img tag when you have it */}
          <h1 className="text-3xl font-bold">
            RANZ Roofing Wage and Charge-out Survey
          </h1>
          <p className="mt-3 text-sm text-slate-700">
            This survey collects anonymous wage and charge-out information from
            Roofing Association of New Zealand members. Results will be used to
            build industry benchmarks by region and role, not to identify any
            individual business. Please answer based on typical current rates
            for your company, excluding one-off arrangements.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company info */}
          <section className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold mb-4">Company details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company name
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.company.companyName}
                  onChange={(e) => updateCompany("companyName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  RANZ member number (optional)
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.company.ranzMemberNumber}
                  onChange={(e) =>
                    updateCompany("ranzMemberNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Region
                </label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.company.region}
                  onChange={(e) => updateCompany("region", e.target.value)}
                >
                  <option value="">Select region</option>
                  <option value="Northland">Northland</option>
                  <option value="Auckland">Auckland</option>
                  <option value="Waikato">Waikato</option>
                  <option value="Bay of Plenty">Bay of Plenty</option>
                  <option value="Gisborne">Gisborne</option>
                  <option value="Hawkes Bay">Hawkes Bay</option>
                  <option value="Taranaki">Taranaki</option>
                  <option value="Manawatu-Whanganui">Manawatu-Whanganui</option>
                  <option value="Wellington">Wellington</option>
                  <option value="Tasman">Tasman</option>
                  <option value="Nelson">Nelson</option>
                  <option value="Marlborough">Marlborough</option>
                  <option value="West Coast">West Coast</option>
                  <option value="Canterbury">Canterbury</option>
                  <option value="Otago">Otago</option>
                  <option value="Southland">Southland</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total staff (including apprentices and office)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.company.totalStaff}
                  onChange={(e) => updateCompany("totalStaff", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Wage tables */}
          <section className="bg-white rounded-xl shadow p-5 space-y-6">
            <h2 className="text-xl font-semibold mb-2">
              Hourly and charge-out rates
            </h2>
            <p className="text-sm text-slate-700 mb-2">
              For each role that you employ, please enter the typical base
              hourly pay and standard charge-out rate (if applicable) for that
              level of experience. If you do not employ a role or do not have a
              particular experience band, leave those fields blank.
            </p>

            {ROLE_DEFS.map((role) => (
              <div key={role.key} className="border rounded-lg p-3 mb-4">
                <h3 className="font-semibold text-sm mb-2">{role.label}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border px-2 py-1 text-left">Band</th>
                        <th className="border px-2 py-1 text-left">
                          Hourly rate (gross, $/hr)
                        </th>
                        <th className="border px-2 py-1 text-left">
                          Charge-out rate (if used, $/hr)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {role.bands.map((band) => {
                        const entry =
                          survey.rates[role.key]?.[band] || ({} as RateEntry);
                        return (
                          <tr key={band}>
                            <td className="border px-2 py-1">
                              {BAND_LABELS[band]}
                            </td>
                            <td className="border px-2 py-1">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                className="w-full border rounded px-1 py-0.5"
                                value={entry.hourlyRate || ""}
                                onChange={(e) =>
                                  updateRate(
                                    role.key,
                                    band,
                                    "hourlyRate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border px-2 py-1">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                className="w-full border rounded px-1 py-0.5"
                                value={entry.chargeOutRate || ""}
                                onChange={(e) =>
                                  updateRate(
                                    role.key,
                                    band,
                                    "chargeOutRate",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          {/* Overtime */}
          <section className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold mb-2">Overtime settings</h2>
            <p className="text-sm text-slate-700 mb-3">
              Please describe your standard overtime trigger and rates for field
              roofing staff. If different roles have different rules, describe
              that in the notes.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hours per week before overtime applies
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.overtime.hoursBeforeOvertime}
                  onChange={(e) =>
                    updateOvertime("hoursBeforeOvertime", e.target.value)
                  }
                  placeholder="e.g. 40, 45, 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Typical overtime multiplier
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.overtime.overtimeMultiplier}
                  onChange={(e) =>
                    updateOvertime("overtimeMultiplier", e.target.value)
                  }
                  placeholder="e.g. 1.5x time and a half, 2.0x"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">
                Overtime notes
              </label>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm"
                rows={3}
                value={survey.overtime.notes}
                onChange={(e) => updateOvertime("notes", e.target.value)}
                placeholder="Example: Time and a half after 45 hours for roofers and apprentices, double time on Sundays, no overtime for office staff."
              />
            </div>
          </section>

          {/* Mileage and vehicle */}
          <section className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold mb-2">
              Mileage, vehicle and travel
            </h2>
            <p className="text-sm text-slate-700 mb-3">
              Please describe your typical mileage or vehicle contribution for
              staff using their own vehicles for roofing work, or any standard
              travel allowances.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Per km mileage rate ($/km)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.mileage.perKmRate}
                  onChange={(e) =>
                    updateMileage("perKmRate", e.target.value)
                  }
                  placeholder="e.g. 0.85"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Flat daily travel allowance ($/day)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={survey.mileage.flatDailyRate}
                  onChange={(e) =>
                    updateMileage("flatDailyRate", e.target.value)
                  }
                  placeholder="e.g. 20"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">
                Vehicle and travel notes
              </label>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm"
                rows={3}
                value={survey.mileage.notes}
                onChange={(e) => updateMileage("notes", e.target.value)}
                placeholder="Example: Company ute for foremen and project managers, per km mileage for apprentices using their own vehicle to get to site, overnight allowance for out of town roofing work."
              />
            </div>
          </section>

          {/* Other benefits */}
          <section className="bg-white rounded-xl shadow p-5">
            <h2 className="text-xl font-semibold mb-2">Other benefits</h2>
            <p className="text-sm text-slate-700 mb-3">
              List any other common benefits that affect the overall package for
              roofing staff, for example height money, tool allowance,
              on-call allowance, training support, health insurance, or bonus
              schemes.
            </p>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm"
              rows={4}
              value={survey.otherBenefits}
              onChange={(e) =>
                setSurvey((prev) => ({
                  ...prev,
                  otherBenefits: e.target.value,
                }))
              }
            />
          </section>

          {/* Actions */}
          <section className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-slate-900 text-white text-sm font-medium"
            >
              Preview survey data
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded border text-sm"
            >
              Reset form
            </button>
          </section>
        </form>

        {/* JSON preview */}
        {showJson && (
          <section className="mt-8 bg-slate-900 text-slate-50 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">
              Survey payload (for API or export)
            </h2>
            <p className="text-xs mb-2">
              This is what will be sent to RANZ when you wire this form to an
              API. Copy it for testing or hook it straight into your backend.
            </p>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(survey, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
