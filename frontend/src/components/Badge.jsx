const statusStyles = {
  Open: "badge-open",
  InProgress: "badge-in-progress",
  Resolved: "badge-resolved",
  Closed: "badge-closed",
};

const priorityStyles = {
  Low: "badge-low",
  Medium: "badge-medium",
  High: "badge-high",
  Critical: "badge-critical",
};

const statusValues = ["Open", "InProgress", "Resolved", "Closed"];
const priorityValues = ["Low", "Medium", "High", "Critical"];

function Badge({ value, type = "status" }) {
  const values = type === "priority" ? priorityValues : statusValues;
  const styles = type === "priority" ? priorityStyles : statusStyles;
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : null;
  const labelValue = numericValue === null ? value : values[numericValue];
  const className = styles[labelValue] || "badge-default";

  const label =
    labelValue === "InProgress" ? "In Progress" : labelValue || "Unknown";

  return (
    <span className={`badge ${className}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

export default Badge;