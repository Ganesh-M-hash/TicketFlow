
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Search } from "lucide-react";
import { useAuth } from "../context/useAuth";
import authService from "../services/authService";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/tickets": "All Tickets",
    "/tickets/new": "Create Ticket",
    "/users": "Users",
    "/users/new": "Add User",
  };

  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.match(/^\/tickets\/[^/]+\/edit$/) ? "Edit Ticket" : "TicketFlow");
  const displayName =
    user?.fullName || user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(/\s+/)
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  async function handleSignOut() {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Failed to notify the API about logout:", error);
    } finally {
      signOut();
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <h1>{currentTitle}</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-icon-button"
          aria-label="Search"
          title="Search"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="header-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="header-divider" />

        <div className="user-profile">
          <div className="user-avatar">{initials}</div>

          <div className="user-info">
            <strong>{displayName}</strong>
            <span>{user?.role || "Team member"}</span>
          </div>
        </div>

        <button
          type="button"
          className="header-logout-button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
