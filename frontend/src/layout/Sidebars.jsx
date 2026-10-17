import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Headset,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "All Tickets",
    path: "/tickets",
    icon: Ticket,
  },
  {
    label: "Create Ticket",
    path: "/tickets/new",
    icon: PlusCircle,
  },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const visibleNavigationItems =
    user?.role === "Administrator"
      ? [
          ...navigationItems,
          { label: "View Users", path: "/users", icon: Users },
          { label: "Add User", path: "/users/new", icon: PlusCircle },
        ]
      : navigationItems;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Headset size={23} />
        </div>

        <div className="brand-text sidebar-copy" aria-hidden={collapsed}>
          <h2>TicketFlow</h2>
          <span>Support Management</span>
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((previous) => !previous)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      <div
        className="sidebar-section-label sidebar-copy"
        aria-hidden={collapsed}
      >
        WORKSPACE
      </div>

      <nav className="sidebar-nav">
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/tickets" || item.path === "/users"}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span
                className="sidebar-link-label"
                aria-hidden={collapsed}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div
        className="sidebar-bottom sidebar-copy"
        aria-hidden={collapsed}
      >
          <div className="sidebar-help">
            <div className="help-icon">
              <Headset size={20} />
            </div>

            <div>
              <strong>Need help?</strong>
              <p>Manage your support tickets here.</p>
            </div>
          </div>

          <div className="sidebar-footer">
            <span className="status-dot" />
            <span>System operational</span>
          </div>
      </div>
    </aside>
  );
}

export default Sidebar;
