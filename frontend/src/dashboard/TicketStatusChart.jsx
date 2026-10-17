
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  Open: "#3b82f6",
  InProgress: "#f59e0b",
  Resolved: "#10b981",
  Closed: "#94a3b8",
};

const STATUS_LABELS = {
  Open: "Open",
  InProgress: "In Progress",
  Resolved: "Resolved",
  Closed: "Closed",
};

function TicketStatusChart({ summary }) {
  const data = [
    { name: "Open", value: summary?.openTickets ?? 0 },
    { name: "InProgress", value: summary?.inProgressTickets ?? 0 },
    { name: "Resolved", value: summary?.resolvedTickets ?? 0 },
    { name: "Closed", value: summary?.closedTickets ?? 0 },
  ].map((item) => ({
    ...item,
    displayName: STATUS_LABELS[item.name],
  }));

  const hasTickets = data.some((item) => item.value > 0);

  return (
    <section className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>Tickets by Status</h3>
          <p>Distribution of all tickets</p>
        </div>
      </div>

      {hasTickets ? (
        <div className="status-chart">
          <ResponsiveContainer width="100%" height="100%" debounce={250}>
            <PieChart>
              <Pie
                data={data.filter((item) => item.value > 0)}
                dataKey="value"
                nameKey="displayName"
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                stroke="none"
              >
                {data
                  .filter((item) => item.value > 0)
                  .map((item) => (
                    <Cell
                      key={item.name}
                      fill={STATUS_COLORS[item.name]}
                    />
                  ))}
              </Pie>

              <Tooltip formatter={(value) => [value, "Tickets"]} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => (
                  <span className="chart-legend-label">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">
          No ticket data available yet.
        </div>
      )}
    </section>
  );
}

export default TicketStatusChart;
