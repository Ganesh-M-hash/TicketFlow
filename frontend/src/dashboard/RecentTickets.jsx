
import { Link } from "react-router-dom";
import { ArrowRight, Ticket } from "lucide-react";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/formatDate.js";

function RecentTickets({ tickets = [] }) {
  return (
    <section className="recent-tickets-card">
      <div className="chart-card-header">
        <div>
          <h3>Recent Tickets</h3>
          <p>Latest support requests</p>
        </div>

        <Link to="/tickets" className="view-all-link">
          View all
          <ArrowRight size={15} />
        </Link>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No recent tickets"
          description="New support requests will appear here."
        />
      ) : (
        <div className="recent-tickets-table-wrapper">
          <table className="recent-tickets-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Requester</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticketNumber}>
                  <td>
                    <div className="recent-ticket-info">
                      <div className="recent-ticket-icon">
                        <Ticket size={16} />
                      </div>

                      <div className="recent-ticket-text">
                        <strong>{ticket.ticketNumber}</strong>
                        <span>{ticket.title}</span>
                      </div>
                    </div>
                  </td>

                  <td>{ticket.requesterName}</td>

                  <td>
                    <Badge value={ticket.priority} type="priority" />
                  </td>

                  <td>
                    <Badge value={ticket.status} />
                  </td>

                  <td>{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecentTickets;
