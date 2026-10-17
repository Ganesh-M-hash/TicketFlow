import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Toast from "../components/Toast.jsx";
import userService from "../services/userService";

const DEFAULT_PAGE_SIZE = 25;

function Users() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    location.state?.toastMessage || ""
  );
  const deleteDialogRef = useRef(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = search.trim();
      if (nextSearch !== debouncedSearch) {
        setLoading(true);
        setPage(1);
        setDebouncedSearch(nextSearch);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    userService
      .getUsers({
        search: debouncedSearch || undefined,
        page,
        pageSize,
      })
      .then((result) => {
        if (cancelled) return;
        if (!Array.isArray(result?.items)) {
          throw new Error("The users API returned an invalid paged response.");
        }
        setUsers(result.items);
        setPage(result.page);
        setPageSize(result.pageSize);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load users:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load users."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page, pageSize, reloadKey]);

  useEffect(() => {
    if (!location.state?.toastMessage) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!userToDelete) return undefined;

    function handleDialogKeyDown(event) {
      if (event.key === "Escape" && !deletingUser) {
        setUserToDelete(null);
        return;
      }

      if (event.key === "Tab") {
        const buttons = deleteDialogRef.current?.querySelectorAll(
          "button:not(:disabled)"
        );
        const firstButton = buttons?.[0];
        const lastButton = buttons?.[buttons.length - 1];

        if (event.shiftKey && document.activeElement === firstButton) {
          event.preventDefault();
          lastButton?.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault();
          firstButton?.focus();
        }
      }
    }

    window.addEventListener("keydown", handleDialogKeyDown);
    return () => window.removeEventListener("keydown", handleDialogKeyDown);
  }, [userToDelete, deletingUser]);

  function handleRefresh() {
    setLoading(true);
    setError("");
    setReloadKey((previous) => previous + 1);
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;

    try {
      setDeletingUser(true);
      await userService.deleteUser(userToDelete.id);
      setToastMessage(`${userToDelete.fullName} was deleted.`);
      setUserToDelete(null);

      if (users.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      }
      setLoading(true);
      setReloadKey((previous) => previous + 1);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setUserToDelete(null);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to delete this user."
      );
    } finally {
      setDeletingUser(false);
    }
  }

  return (
    <div className="users-page">
      <Toast message={toastMessage} onClose={setToastMessage} />

      {userToDelete && (
        <div
          className="delete-dialog-backdrop"
          onClick={() => !deletingUser && setUserToDelete(null)}
          role="presentation"
        >
          <section
            className="delete-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-dialog-title"
            aria-describedby="delete-user-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-dialog-icon">
              <Trash2 size={21} aria-hidden="true" />
            </div>
            <p className="delete-dialog-eyebrow">DELETE USER</p>
            <h2 id="delete-user-dialog-title">
              Delete {userToDelete.fullName}?
            </h2>
            <p id="delete-user-dialog-description">
              This user will be removed and can no longer be assigned to tickets.
              This action cannot be undone.
            </p>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="delete-dialog-cancel"
                onClick={() => setUserToDelete(null)}
                disabled={deletingUser}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-dialog-confirm"
                onClick={handleDeleteUser}
                disabled={deletingUser}
              >
                <Trash2 size={16} aria-hidden="true" />
                {deletingUser ? "Deleting..." : "Delete user"}
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="users-page-heading">
        <div>
          <h2>Users</h2>
          <p>Manage team members and ticket assignment options.</p>
        </div>
        <Link to="/users/new" className="page-header-action">
          <Plus size={17} />
          <span>Add User</span>
        </Link>
      </div>

      {error && (
        <div className="tickets-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            Try again
          </button>
        </div>
      )}

      <form
        className="tickets-filters users-filters"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="tickets-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users by name or email..."
            aria-label="Search users by name or email"
          />
        </div>
      </form>

      <section className="tickets-table-card">
        <div className="tickets-table-heading users-table-heading">
          <div>
            <h3>Team members</h3>
            <p>
              {loading
                ? "Loading users..."
                : `${totalCount} ${totalCount === 1 ? "user" : "users"}`}
            </p>
          </div>
          <button
            type="button"
            className="tickets-reset-button users-refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh users"
            title="Refresh users"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            title={debouncedSearch ? "No users found" : "No users yet"}
            description={
              debouncedSearch
                ? "Try a different name or email address."
                : "Add a team member to make them available for ticket assignment."
            }
            actionLabel={debouncedSearch ? undefined : "Add User"}
            onAction={
              debouncedSearch ? undefined : () => navigate("/users/new")
            }
          />
        ) : (
          <div className="tickets-table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="tickets-requester-cell">
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={`user-state ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="ticket-row-actions">
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="ticket-edit-button"
                          aria-label={`Edit ${user.fullName}`}
                          title="Edit user"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          className="ticket-delete-button"
                          onClick={() => setUserToDelete(user)}
                          aria-label={`Delete ${user.fullName}`}
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalCount > 0 && (
          <div className="tickets-pagination">
            <div className="tickets-pagination-size">
              <label htmlFor="users-page-size">Rows per page</label>
              <select
                id="users-page-size"
                value={pageSize}
                onChange={(event) => {
                  setLoading(true);
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <span className="tickets-pagination-summary">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>

            <div className="tickets-pagination-controls">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((previous) => previous - 1);
                }}
                disabled={loading || page <= 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((previous) => previous + 1);
                }}
                disabled={loading || page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Users;
