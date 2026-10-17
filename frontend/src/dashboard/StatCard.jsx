
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value = 0,
  icon: Icon,
  color = "indigo",
  change,
  changeLabel = "vs. last period",
}) {
  const isPositive = Number(change) >= 0;

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-title">{title}</div>

        {Icon && (
          <div className={`stat-card-icon ${color}`}>
            <Icon size={21} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <div className="stat-card-value">
        {Number(value).toLocaleString("en-IN")}
      </div>

      {change !== undefined && change !== null && (
        <div className="stat-card-footer">
          <span
            className={`stat-card-change ${
              isPositive ? "positive" : "negative"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowDownRight size={15} />
            )}
            {Math.abs(Number(change))}%
          </span>

          <span className="stat-card-change-label">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
