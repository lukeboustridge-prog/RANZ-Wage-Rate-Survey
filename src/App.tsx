import React, { useState } from "react";
import ranzLogo from "./assets/ranz-logo.png";

type ExperienceBand =
  | "1_year"
  | "3_years"
  | "6_years"
  | "8_plus"
  | "apprentice_1"
  | "apprentice_2"
  | "apprentice_3"
  | "apprentice_4";

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
    label: "Qualified Roofer, Residential / Re-roof",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "qualified_commercial",
    label: "Qualified Roofer, Commercial / Industrial",
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
    label: "Estimator / Quantity Surveyor, Roofing",
    bands: ["1_year", "3_years", "6_years", "8_plus"],
  },
  {
    key: "project_manager",
    label: "Project Manager, Roofing",
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
  "apprentice_1": "Year 1 / Stage 1",
  "apprentice_2": "Year 2 / Stage 2",
  "apprentice_3": "Year 3 / Stage 3",
  "apprentice_4": "Year 4 / Stage 4",
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
  overtimeMultiplier: string;
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
  isLbp: boolean;
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
    isLbp: false,
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
  const [submitting, setSubmitting] = useState(false);

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

  const handleReset = () => {
    setSurvey(emptySurvey);
    setShowJson(false);
  };

  const handlePreviewJson = () => {
    setShowJson(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setShowJson(false);

    try {
      const response = await fetch("/api/submit-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(survey),
      });

      if (!response.ok) {
        console.error("Submit failed", await response.text());
        alert("There was a problem submitting your survey. Please try again.");
        return;
      }

      alert("Thank you, your survey has been submitted to RANZ.");
      handleReset();
    } catch (err) {
      console.error("Submit error", err);
      alert("Network error submitting survey.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <img
            src={ranzLogo}
            alt="Roofing Association of New Zealand"
            className="app-header-logo"
          />
          <div>
            <h1 className="app-title">RANZ Roofing Wage and Rate Survey</h1>
            <p className="app-subtitle">
              This tool lets RANZ members enter typical wages and charge out
              rates for key roofing roles. Data is used to build industry
              benchmarks by region, not to publish individual company figures.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="app-section">
            <h2 className="app-section-title">Company details</h2>
            <p className="app-section-help">
              Basic context so results can be grouped by region and company size.
            </p>
            <div className="grid-two">
              <div>
                <label className="label">Company name</label>
                <input
                  className="input"
                  value={survey.company.companyName}
                  onChange={(e) =>
                    updateCompany("companyName", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="label">RANZ member number (optional)</label>
                <input
                  className="input"
                  value={survey.company.ranzMemberNumber}
                  onChange={(e) =>
                    updateCompany("ranzMemberNumber", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Region</label>
                <select
                  className="select"
                  value={survey.company.region}
                  onChange={(e) => updateCompany("region", e.target.value)}
                  required
                >
                  <option value="">Select region</option>
                  <option value="Northland">Northland</option>
                  <option value="Auckland">Auckland</option>
                  <option value="Waikato">Waikato</option>
                  <option value="Bay of Plenty">Bay of Plenty</option>
                  <option value="Gisborne">Gisborne</option>
                  <option value="Hawkes Bay">Hawkes Bay</option>
                  <option value="Taranaki">Taranaki</option>
                  <option value="Manawatu-Whanganui">
                    Manawatu Whanganui
                  </option>
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
                <label className="label">
                  Total staff (including apprentices and office)
                </label>
                <input
                  type="number"
                  className="input"
                  value={survey.company.totalStaff}
                  onChange={(e) =>
                    updateCompany("totalStaff", e.target.value)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={survey.company.isLbp}
                  onChange={(e) =>
                    setSurvey((prev) => ({
                      ...prev,
                      company: { ...prev.company, isLbp: e.target.checked },
                    }))
                  }
                />
                Are the wage rates below for Licensed Building Practitioners (LBP)?
              </label>
            </div>
          </section>

          <section className="app-section">
            <h2 className="app-section-title">
              Hourly and charge out rates by role
            </h2>
            <p className="app-section-help">
              Only fill in rows for roles you actually employ. Leave fields
              blank if a band does not apply in your business.
            </p>
            {ROLE_DEFS.map((role) => (
              <div key={role.key} className="role-card">
                <p className="role-title">{role.label}</p>
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Band</th>
                        <th>Hourly rate, gross, dollars per hour</th>
                        <th>Charge out rate, dollars per hour</th>
                      </tr>
                    </thead>
                    <tbody>
                      {role.bands.map((band) => {
                        const entry =
                          survey.rates[role.key]?.[band] || ({} as RateEntry);
                        return (
                          <tr key={band}>
                            <td>{BAND_LABELS[band]}</td>
                            <td>
                              <input
                                type="number"
                                className="input"
                                value={entry.hourlyRate || ""}
                                onChange={(e) =>
                                  updateRate(
                                    role.key,
                                    band,
                                    "hourlyRate",
                                    e.target.value
                                  )
                                }
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="input"
                                value={entry.chargeOutRate || ""}
                                onChange={(e) =>
                                  updateRate(
                                    role.key,
                                    band,
                                    "chargeOutRate",
                                    e.target.value
                                  )
                                }
                                onWheel={(e) => e.currentTarget.blur()}
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

          <section className="app-section">
            <h2 className="app-section-title">Overtime settings</h2>
            <p className="app-section-help">
              Typical overtime rules for field roofing staff. If it varies by
              role, explain that in the notes.
            </p>
            <div className="grid-two">
              <div>
                <label className="label">
                  Hours per week before overtime applies
                </label>
                <input
                  type="number"
                  className="input"
                  value={survey.overtime.hoursBeforeOvertime}
                  onChange={(e) =>
                    updateOvertime("hoursBeforeOvertime", e.target.value)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="For example 40, 45, 50"
                />
              </div>
              <div>
                <label className="label">Typical overtime multiplier</label>
                <input
                  className="input"
                  value={survey.overtime.overtimeMultiplier}
                  onChange={(e) =>
                    updateOvertime("overtimeMultiplier", e.target.value)
                  }
                  placeholder="For example 1.5x, 2.0x"
                />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label className="label">Overtime notes</label>
              <textarea
                className="textarea"
                rows={3}
                value={survey.overtime.notes}
                onChange={(e) =>
                  updateOvertime("notes", e.target.value)
                }
                placeholder="Example, time and a half after 45 hours for roofers and apprentices, double time on Sundays."
              />
            </div>
          </section>

          <section className="app-section">
            <h2 className="app-section-title">Mileage, vehicle and travel</h2>
            <p className="app-section-help">
              How you usually handle travel costs for staff going to roofing
              sites.
            </p>
            <div className="grid-two">
              <div>
                <label className="label">Per kilometre rate, dollars</label>
                <input
                  type="number"
                  className="input"
                  value={survey.mileage.perKmRate}
                  onChange={(e) =>
                    updateMileage("perKmRate", e.target.value)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="For example 0.85"
                />
              </div>
              <div>
                <label className="label">Flat daily allowance, dollars</label>
                <input
                  type="number"
                  className="input"
                  value={survey.mileage.flatDailyRate}
                  onChange={(e) =>
                    updateMileage("flatDailyRate", e.target.value)
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="For example 20"
                />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label className="label">Vehicle and travel notes</label>
              <textarea
                className="textarea"
                rows={3}
                value={survey.mileage.notes}
                onChange={(e) =>
                  updateMileage("notes", e.target.value)
                }
                placeholder="Example, company ute for foremen, mileage for apprentices using their own vehicle."
              />
            </div>
          </section>

          <section className="app-section">
            <h2 className="app-section-title">Other benefits</h2>
            <p className="app-section-help">
              Anything else that affects the effective package, such as height
              money, tool allowance, health insurance, bonuses or training
              support.
            </p>
            <textarea
              className="textarea"
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

          <div className="button-row">
            <button
              type="submit"
              className="button-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit survey"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handlePreviewJson}
            >
              Preview JSON payload
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={handleReset}
            >
              Reset form
            </button>
          </div>
        </form>

        {showJson && (
          <div className="json-panel">
            <p className="json-title">Survey payload</p>
            <p className="json-subtitle">
              This is the JSON sent to the RANZ survey API.
            </p>
            <pre>{JSON.stringify(survey, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

