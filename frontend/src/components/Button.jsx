import { LoaderCircle } from "lucide-react";

function Button({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon: Icon,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <LoaderCircle size={17} className="btn-spinner" />
      ) : (
        Icon && <Icon size={17} />
      )}

      {children && <span>{children}</span>}
    </button>
  );
}

export default Button;