
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function TicketTrendChart({ trends = [] }) {
  const data = trends.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    created: item.createdCount ?? 0,
    resolved: item.resolvedCount ?? 0,
  }));

  const hasData = data.some(
    (item) => item.created > 0 || item.resolved > 0
  );

  return (
    <section className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>Ticket Activity</h3>
          <p>Tickets created and resolved over the last 7 days</p>
        </div>
      </div>

      {hasData ? (
        <div className="trend-chart">
          <ResponsiveContainer width="100%" height="100%" debounce={250}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 12, left: -18, bottom: 4 }}
            >
              <defs>
                <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }}
              />

              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#createdGradient)"
              />

              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#resolvedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">
          No ticket activity available yet.
        </div>
      )}
    </section>
  );
}

export default TicketTrendChart;
