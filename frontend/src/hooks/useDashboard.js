import { useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";

function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await dashboardService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(
          err.response?.data?.detail ||
            err.response?.data?.title ||
            "Unable to load dashboard data. Please check whether the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { summary, loading, error };
}

export default useDashboard;
