import { LoaderCircle } from "lucide-react";

function LoadingSpinner({
  message = "Loading...",
  size = "large",
}) {
  return (
    <div className={`loading-container loading-${size}`}>
      <LoaderCircle
        className="loading-spinner"
        size={30}
        aria-hidden="true"
      />
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;