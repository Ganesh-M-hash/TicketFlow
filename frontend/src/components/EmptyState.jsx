import { Inbox } from "lucide-react";
import Button from "./Button.jsx";

function EmptyState({
  title = "No tickets found",
  description = "There are no tickets to display right now.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Inbox size={28} strokeWidth={1.6} />
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      {actionLabel && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;