import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ranzLogo from "../assets/ranz-logo.png";

interface DashboardStats {
  totalSubmissions: number;
  totalRates: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/staff-portal");
      return;
    }

    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch("/api/admin/export?stats=true", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("authToken");
        navigate("/staff-portal");
        return;
      }

      if (!response.ok) {
        setError("Failed to load dashboard data");
        return;
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError("Network error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/staff-portal");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/export", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("authToken");
        navigate("/staff-portal");
        return;
      }

      if (!response.ok) {
        setError("Failed to export data");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ranz-survey-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Network error during export");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/staff-portal");
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const logoStyle: React.CSSProperties = {
    height: 40,
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    color: "#0f172a",
    marginLeft: 16,
  };

  const logoutButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    fontSize: 14,
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    cursor: "pointer",
  };

  const mainStyle: React.CSSProperties = {
    maxWidth: 800,
    margin: "0 auto",
    padding: 32,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 8,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
  };

  const cardGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 24,
    marginBottom: 32,
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: 36,
    fontWeight: 700,
    color: "#0f172a",
  };

  const actionCardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 32,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  };

  const actionTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 8,
  };

  const actionDescStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  };

  const exportButtonStyle: React.CSSProperties = {
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "#0f172a",
    border: "none",
    borderRadius: 8,
    cursor: exporting ? "not-allowed" : "pointer",
    opacity: exporting ? 0.7 : 1,
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px 14px",
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 24,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...mainStyle, textAlign: "center", paddingTop: 100 }}>
          <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={ranzLogo} alt="RANZ" style={logoStyle} />
          <span style={headerTitleStyle}>Admin Dashboard</span>
        </div>
        <button style={logoutButtonStyle} onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main style={mainStyle}>
        <h1 style={titleStyle}>Survey Dashboard</h1>
        <p style={subtitleStyle}>
          View submission statistics and export survey data.
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={cardGridStyle}>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Total Submissions</p>
            <p style={statValueStyle}>{stats?.totalSubmissions ?? 0}</p>
          </div>
          <div style={statCardStyle}>
            <p style={statLabelStyle}>Rate Entries</p>
            <p style={statValueStyle}>{stats?.totalRates ?? 0}</p>
          </div>
        </div>

        <div style={actionCardStyle}>
          <h2 style={actionTitleStyle}>Export Survey Data</h2>
          <p style={actionDescStyle}>
            Download all survey submissions and rate data as a CSV file for
            analysis in Excel or other tools.
          </p>
          <button
            style={exportButtonStyle}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Download CSV"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
