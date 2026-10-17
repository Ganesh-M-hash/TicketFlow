
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, House } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>

      <h2>Page not found</h2>

      <p>
        Sorry, we couldn't find the page you're looking for.
        It may have been moved or the URL may be incorrect.
      </p>

      <div className="not-found-actions">
        <button
          type="button"
          className="not-found-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Go back
        </button>

        <Link to="/dashboard" className="page-header-action">
          <House size={17} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;