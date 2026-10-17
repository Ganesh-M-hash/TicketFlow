
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, RefreshCw, Pencil } from "lucide-react";

import ticketService from "../services/ticketService";
import Badge from "../components/Badge.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Toast from "../components/Toast.jsx";
import { formatDate } from "../utils/formatDate";

const DEFAULT_PAGE_SIZE = 10;

function Tickets() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingTicket, setDeletingTicket] = useState("");
  const [ticketToDelete, setTicketToDelete] = useState("");
  const deleteDialogRef = useRef(null);

  const [toastMessage, setToastMessage] = useState(
    location.state?.toastMessage || ""
  );

  useEffect(() => {
    if (!location.state?.toastMessage) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    loadTickets(1, {}, DEFAULT_PAGE_SIZE);
  }, []);

  useEffect(() => {
    if (!ticketToDelete) return;

    function handleDialogKeyDown(event) {
      if (event.key === "Escape" && !deletingTicket) {
        setTicketToDelete("");
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
  }, [ticketToDelete, deletingTicket]);

  async function loadTickets(requestedPage, filters, requestedPageSize) {
    try {
      setLoading(true);
      setError("");

      const data = await ticketService.getTickets({
        ...filters,
        page: requestedPage,
        pageSize: requestedPageSize,
      });
      const items = Array.isArray(data) ? data : data?.items ?? [];
      const count = data?.totalCount ?? items.length;

      setTickets(items);
      setPage(data?.page ?? requestedPage);
      setPageSize(data?.pageSize ?? requestedPageSize);
      setTotalCount(count);
      setTotalPages(
        data?.totalPages ?? Math.ceil(count / requestedPageSize)
      );
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.title ||
          "Unable to load tickets. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const ticketNumber = ticketToDelete;
    if (!ticketNumber) return;

    try {
      setDeletingTicket(ticketNumber);
      setError("");
      await ticketService.deleteTicket(ticketNumber);

      setToastMessage(`Ticket ${ticketNumber} deleted successfully.`);
      setTicketToDelete("");
      await loadTickets(
        page > 1 && tickets.length === 1 ? page - 1 : page,
        appliedFilters,
        pageSize
      );
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      setTicketToDelete("");
      setError(
        err.response?.data?.detail ||
          err.response?.data?.title ||
          "Unable to delete this ticket."
      );
    } finally {
      setDeletingTicket("");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    const filters = {};
    if (search.trim()) filters.search = search.trim();
    if (status) filters.status = status;
    if (priority) filters.priority = priority;

    setAppliedFilters(filters);
    loadTickets(1, filters, pageSize);
  }

  function handleReset() {
    setSearch("");
    setStatus("");
    setPriority("");
    setAppliedFilters({});
    loadTickets(1, {}, pageSize);
  }

  return (
    <div className="tickets-page">
      <Toast message={toastMessage} onClose={setToastMessage} />

      {ticketToDelete && (
        <div
          className="delete-dialog-backdrop"
          onClick={() => !deletingTicket && setTicketToDelete("")}
          role="presentation"
        >
          <section
            className="delete-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-dialog-icon">
              <Trash2 size={21} aria-hidden="true" />
            </div>
            <p className="delete-dialog-eyebrow">DELETE TICKET</p>
            <h2 id="delete-dialog-title">Delete {ticketToDelete}?</h2>
            <p id="delete-dialog-description">
              This ticket will be permanently removed. This action cannot be undone.
            </p>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="delete-dialog-cancel"
                onClick={() => setTicketToDelete("")}
                disabled={Boolean(deletingTicket)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-dialog-confirm"
                onClick={handleDelete}
                disabled={Boolean(deletingTicket)}
              >
                <Trash2 size={16} aria-hidden="true" />
                {deletingTicket ? "Deleting..." : "Delete ticket"}
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="tickets-page-heading">
        <div>
          <h2>All Tickets</h2>
          <p>Search, review, and manage support requests.</p>
        </div>

        <Link to="/tickets/new" className="page-header-action">
          <Plus size={17} />
          <span>Create Ticket</span>
        </Link>
      </div>

      {error && (
        <div className="tickets-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadTickets(page, appliedFilters, pageSize)}
          >
            Try again
          </button>
        </div>
      )}

      <form className="tickets-filters" onSubmit={handleSearch}>
        <div className="tickets-search">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets..."
            aria-label="Search tickets"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <button type="submit" className="tickets-filter-button">
          Apply
        </button>

        <button
          type="button"
          className="tickets-reset-button"
          onClick={handleReset}
          title="Reset filters"
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </form>

      <div className="tickets-table-card">
        <div className="tickets-table-heading">
          <div>
            <h3>Support Requests</h3>
            <p>{loading ? "Loading tickets..." : `${totalCount} tickets found`}</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading tickets..." />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description="Try changing your filters or create a new support ticket."
            actionLabel="Create Ticket"
            onAction={() => navigate("/tickets/new")}
          />
        ) : (
          <div className="tickets-table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Requester</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.ticketNumber}>
                    <td>
                      <div className="tickets-ticket-cell">
                        <strong>{ticket.ticketNumber}</strong>
                        <span>{ticket.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="tickets-requester-cell">
                        <strong>{ticket.requesterName}</strong>
                        <span>{ticket.requesterEmail}</span>
                      </div>
                    </td>
                    <td>
                      <Badge value={ticket.priority} type="priority" />
                    </td>
                    <td>
                      <Badge value={ticket.status} />
                    </td>
                    <td>{ticket.assignedTo || "Unassigned"}</td>
                    <td>{formatDate(ticket.createdAt)}</td>
                    <td>
                      <div className="ticket-row-actions">
                        <Link
                          to={`/tickets/${encodeURIComponent(ticket.ticketNumber)}/edit`}
                          className="ticket-edit-button"
                          aria-label={`Edit ${ticket.ticketNumber}`}
                          title="Edit ticket"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          className="ticket-delete-button"
                          onClick={() => setTicketToDelete(ticket.ticketNumber)}
                          disabled={deletingTicket === ticket.ticketNumber}
                          aria-label={`Delete ${ticket.ticketNumber}`}
                          title="Delete ticket"
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
              <label htmlFor="tickets-page-size">Rows per page</label>
              <select
                id="tickets-page-size"
                value={pageSize}
                onChange={(event) => {
                  const nextPageSize = Number(event.target.value);
                  setPageSize(nextPageSize);
                  loadTickets(1, appliedFilters, nextPageSize);
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
                onClick={() => loadTickets(page - 1, appliedFilters, pageSize)}
                disabled={loading || page <= 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => loadTickets(page + 1, appliedFilters, pageSize)}
                disabled={loading || page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tickets;
