import {
  Ticket,
  CircleDot,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  UserX,
} from "lucide-react";

import PageHeader from "../layout/PageHeader";
import StatCard from "../dashboard/StatCard";
import TicketStatusChart from "../dashboard/TicketStatusChart";
import TicketPriorityChart from "../dashboard/TicketPriorityChart";
import TicketTrendChart from "../dashboard/TicketTrendChart";
import RecentTickets from "../dashboard/RecentTickets";
import LoadingSpinner from "../components/LoadingSpinner";
import useDashboard from "../hooks/useDashboard";

function Dashboard() {
  const { summary, loading, error } = useDashboard();

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={24} />
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tickets",
      value: summary?.totalTickets,
      icon: Ticket,
      color: "indigo",
    },
    {
      title: "Open Tickets",
      value: summary?.openTickets,
      icon: CircleDot,
      color: "blue",
    },
    {
      title: "In Progress",
      value: summary?.inProgressTickets,
      icon: Clock3,
      color: "orange",
    },
    {
      title: "Resolved Tickets",
      value: summary?.resolvedTickets,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Critical Tickets",
      value: summary?.criticalTickets,
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: "Unassigned",
      value: summary?.unassignedTickets,
      icon: UserX,
      color: "orange",
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard Overview"
        description="Monitor support requests and track your team's performance."
      />

      <div className="dashboard-stats-grid">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="dashboard-charts-grid">
        <TicketStatusChart summary={summary} />
        <TicketPriorityChart summary={summary} />
      </div>

      <div className="dashboard-trend-grid">
        <TicketTrendChart trends={summary?.ticketTrends ?? []} />
      </div>

      <div className="dashboard-recent-grid">
        <RecentTickets tickets={summary?.recentTickets ?? []} />
      </div>
    </div>
  );
}

export default Dashboard;
