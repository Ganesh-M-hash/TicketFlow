
import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ArrowLeft, Send, RotateCcw, Pencil } from "lucide-react";

import ticketService from "../services/ticketService";
import userService from "../services/userService";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/useAuth";

const PRIORITY_VALUES = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};
const STATUS_VALUES = {
  Open: 0,
  InProgress: 1,
  Resolved: 2,
  Closed: 3,
};
const PRIORITY_NAMES = Object.keys(PRIORITY_VALUES);
const STATUS_NAMES = Object.keys(STATUS_VALUES);

function enumName(value, names) {
  if (typeof value === "number" || /^\d+$/.test(value)) {
    return names[Number(value)] || names[0];
  }

  return names.includes(value) ? value : names[0];
}

function CreateTicket() {
  const navigate = useNavigate();
  const { ticketNumber } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(ticketNumber);
  const canAssignUsers = user?.role === "Administrator";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    requesterName: "",
    requesterEmail: "",
    assignedTo: "",
    assignedToEmail: "",
    status: "Open",
  });

  const [ticketLoading, setTicketLoading] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    if (!canAssignUsers) return undefined;

    let cancelled = false;
    async function loadUsers() {
      setUsersLoading(true);
      setUsersError("");

      try {
        const result = await userService.getAllUsers();
        if (!cancelled) setUsers(result);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load users for ticket assignment:", err);
        setUsersError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load team members."
        );
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [canAssignUsers]);

  useEffect(() => {
    if (!ticketNumber) return undefined;

    let cancelled = false;
    ticketService
      .getTicketByNumber(ticketNumber)
      .then((ticket) => {
        if (cancelled) return;

        setFormData({
          title: ticket.title || "",
          description: ticket.description || "",
          category: ticket.category || "",
          priority: enumName(ticket.priority, PRIORITY_NAMES),
          requesterName: ticket.requesterName || "",
          requesterEmail: ticket.requesterEmail || "",
          assignedTo: ticket.assignedTo || "",
          assignedToEmail: ticket.assignedToEmail || "",
          status: enumName(ticket.status, STATUS_NAMES),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load ticket for editing:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load this ticket for editing."
        );
      })
      .finally(() => {
        if (!cancelled) setTicketLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticketNumber]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const activeUsers = users.filter((item) => item.isActive);
  const currentAssignee = users.find(
    (item) =>
      (formData.assignedToEmail &&
        item.email?.toLowerCase() ===
          formData.assignedToEmail.toLowerCase()) ||
      (formData.assignedTo &&
        item.fullName?.toLowerCase() === formData.assignedTo.toLowerCase())
  );

  function handleAssigneeChange(event) {
    const selectedUser = activeUsers.find(
      (item) => String(item.id) === event.target.value
    );

    if (!selectedUser) {
      setFormData((previous) => ({
        ...previous,
        assignedTo: "",
        assignedToEmail: "",
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      assignedTo: selectedUser.fullName,
      assignedToEmail: selectedUser.email,
    }));
  }

  const handleReset = () => {
    if (isEditing) return;

    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "Medium",
      requesterName: "",
      requesterEmail: "",
      assignedTo: "",
      assignedToEmail: "",
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const ticket = {
        ...formData,
        ticketNumber: ticketNumber || "PENDING",
        priority: PRIORITY_VALUES[formData.priority],
        status: STATUS_VALUES[formData.status],
        assignedTo: formData.assignedTo.trim() || null,
        assignedToEmail: formData.assignedToEmail.trim() || null,
      };

      if (isEditing) {
        await ticketService.updateTicket(ticketNumber, ticket);
      } else {
        const createdTicket = await ticketService.createTicket(ticket);
        navigate("/tickets", {
          state: {
            toastMessage: `Ticket ${createdTicket.ticketNumber} added successfully.`,
          },
        });
        return;
      }

      navigate("/tickets", {
        state: {
          toastMessage: `Ticket ${ticketNumber} updated successfully.`,
        },
      });
    } catch (err) {
      console.error(
        `Failed to ${isEditing ? "update" : "create"} ticket:`,
        err
      );

      const responseData = err.response?.data;

      setError(
        responseData?.detail ||
          (responseData?.errors
            ? Object.values(responseData.errors).flat().join(" ")
            : responseData?.title) ||
            `Unable to ${isEditing ? "update" : "create"} the ticket. Please check the form and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-top">
        <Link to="/tickets" className="back-link">
          <ArrowLeft size={17} />
          Back to tickets
        </Link>
      </div>

      {ticketLoading ? (
        <LoadingSpinner message="Loading ticket..." />
      ) : (
        <>
      <div className="create-ticket-heading">
        <div>
          <span className="create-ticket-eyebrow">
            {isEditing ? `SUPPORT REQUEST / ${ticketNumber}` : "SUPPORT INTAKE / NEW REQUEST"}
          </span>
          <h2>{isEditing ? "Edit support ticket" : "Create a support ticket"}</h2>
          <p>
            {isEditing
              ? "Update the ticket details and save your changes."
              : "Capture the issue and the right contact details for follow-up."}
          </p>
        </div>
        <span className="create-ticket-mark" aria-hidden="true">
          {isEditing ? <Pencil size={21} /> : <Send size={21} />}
        </span>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <form className="ticket-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <div className="form-section-heading">
            <span className="form-step-number">01</span>
            <div>
              <h3>Issue details</h3>
              <p>Describe what happened and how it affects the requester.</p>
            </div>
          </div>

          <div className="form-grid">
            {isEditing && (
              <div className="form-field">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}
            <div className="form-field form-field-full">
              <label htmlFor="title">Ticket Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                placeholder="Briefly describe the issue"
                required
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={2000}
                rows={5}
                placeholder="Provide details about the issue..."
                required
              />
              <span className="field-hint">
                {formData.description.length}/2000 characters
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="Technical">Technical</option>
                <option value="Account">Account</option>
                <option value="Billing">Billing</option>
                <option value="Access">Access</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-field form-field-full">
              <span className="form-field-label" id="priority-label">
                Priority *
              </span>
              <div
                className="priority-options"
                role="radiogroup"
                aria-labelledby="priority-label"
              >
                {[
                  { value: "Low", detail: "Minor impact" },
                  { value: "Medium", detail: "Standard request" },
                  { value: "High", detail: "Work is blocked" },
                  { value: "Critical", detail: "Service outage" },
                ].map((priority) => (
                  <label
                    key={priority.value}
                    className={`priority-option priority-${priority.value.toLowerCase()} ${
                      formData.priority === priority.value ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleChange}
                      required
                    />
                    <span className="priority-option-copy">
                      <strong>{priority.value}</strong>
                      <small>{priority.detail}</small>
                    </span>
                    <span className="priority-option-dot" aria-hidden="true" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="form-step-number">02</span>
            <div>
              <h3>Requester</h3>
              <p>Who should the support team contact about this issue?</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="requesterName">Requester Name *</label>
              <input
                id="requesterName"
                name="requesterName"
                type="text"
                value={formData.requesterName}
                onChange={handleChange}
                maxLength={150}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="requesterEmail">Requester Email *</label>
              <input
                id="requesterEmail"
                name="requesterEmail"
                type="email"
                value={formData.requesterEmail}
                onChange={handleChange}
                maxLength={254}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <span className="form-step-number">03</span>
            <div>
              <h3>Assignment <span className="optional-label">OPTIONAL</span></h3>
              <p>Route this request directly to a support team member.</p>
            </div>
          </div>

          <div className="form-grid">
            {canAssignUsers && !usersError ? (
              <div className="form-field form-field-full">
                <label htmlFor="assignedUser">Assign to team member</label>
                <select
                  id="assignedUser"
                  value={
                    currentAssignee
                      ? String(currentAssignee.id)
                      : formData.assignedTo
                        ? "existing"
                        : ""
                  }
                  onChange={handleAssigneeChange}
                  disabled={usersLoading}
                >
                  <option value="">
                    {usersLoading ? "Loading team members..." : "Unassigned"}
                  </option>
                  {currentAssignee && !currentAssignee.isActive && (
                    <option value={String(currentAssignee.id)}>
                      {currentAssignee.fullName} (inactive)
                    </option>
                  )}
                  {formData.assignedTo && !currentAssignee && (
                    <option value="existing">{formData.assignedTo}</option>
                  )}
                  {activeUsers.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.fullName} ({item.email})
                    </option>
                  ))}
                </select>
                {users.length === 0 && !usersLoading && (
                  <span className="field-hint">
                    No team members are available. Add a user first.
                  </span>
                )}
              </div>
            ) : (
              <>
                {usersError && (
                  <p className="assignment-error" role="alert">
                    {usersError} Enter the assignee details manually.
                  </p>
                )}
                <div className="form-field">
                  <label htmlFor="assignedTo">Assigned To</label>
                  <input
                    id="assignedTo"
                    name="assignedTo"
                    type="text"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="Support team member"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="assignedToEmail">Assignee Email</label>
                  <input
                    id="assignedToEmail"
                    name="assignedToEmail"
                    type="email"
                    value={formData.assignedToEmail}
                    onChange={handleChange}
                    maxLength={254}
                    placeholder="support@example.com"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <div className="ticket-form-footer">
          {!isEditing && (
            <Button
              variant="secondary"
              type="button"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          )}

          <Button
            variant="primary"
            type="submit"
            icon={isEditing ? Pencil : Send}
            loading={loading}
            disabled={loading || Boolean(error && isEditing && !formData.title)}
          >
            {isEditing ? "Save Changes" : "Create Ticket"}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}

export default CreateTicket;
