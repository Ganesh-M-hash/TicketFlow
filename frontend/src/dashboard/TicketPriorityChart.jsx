
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PRIORITY_COLORS = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

function TicketPriorityChart({ summary }) {
  const data = [
    { name: "Low", value: summary?.lowPriorityTickets ?? 0 },
    { name: "Medium", value: summary?.mediumPriorityTickets ?? 0 },
    { name: "High", value: summary?.highPriorityTickets ?? 0 },
    { name: "Critical", value: summary?.criticalTickets ?? 0 },
  ];

  const hasTickets = data.some((item) => item.value > 0);

  return (
    <section className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>Tickets by Priority</h3>
          <p>Ticket volume across priority levels</p>
        </div>
      </div>

      {hasTickets ? (
        <div className="priority-chart">
          <ResponsiveContainer width="100%" height="100%" debounce={250}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />

              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                formatter={(value) => [value, "Tickets"]}
              />

              <Bar
                dataKey="value"
                name="Tickets"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {data.map((item) => (
                  <Cell
                    key={item.name}
                    fill={PRIORITY_COLORS[item.name]}
                  />
                ))}
              </Bar>
            </BarChart>
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

export default TicketPriorityChart;
