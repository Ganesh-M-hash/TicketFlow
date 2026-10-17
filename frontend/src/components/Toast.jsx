import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

function Toast({ message, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => onClose(""), duration);
    return () => window.clearTimeout(timeoutId);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast toast-success" role="status" aria-live="polite">
      <CheckCircle2 size={19} aria-hidden="true" />
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-dismiss"
        onClick={() => onClose("")}
        aria-label="Dismiss notification"
        title="Dismiss notification"
      >
        <X size={17} />
      </button>
    </div>
  );
}

export default Toast;