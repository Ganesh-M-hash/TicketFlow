
import { ArrowRight } from "lucide-react";

function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = ArrowRight,
}) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {actionLabel && (
        <button
          type="button"
          className="page-header-action"
          onClick={onAction}
        >
          <ActionIcon size={17} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export default PageHeader;
