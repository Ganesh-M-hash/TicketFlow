import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, UserPlus } from "lucide-react";

import Button from "../components/Button.jsx";
import userService from "../services/userService";

function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Agent",
    isActive: true,
  });
  const [userLoading, setUserLoading] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;
    userService
      .getUserById(id)
      .then((user) => {
        if (cancelled) return;
        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          password: "",
          role: user.role || "Agent",
          isActive: Boolean(user.isActive),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load user for editing:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Unable to load this user."
        );
      })
      .finally(() => {
        if (!cancelled) setUserLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
      };

      if (isEditing) {
        await userService.updateUser(id, user);
      } else {
        await userService.createUser({ ...user, password: formData.password });
      }

      navigate("/users", {
        state: {
          toastMessage: isEditing
            ? `${formData.fullName.trim()} was updated.`
            : `${formData.fullName.trim()} was added.`,
        },
      });
    } catch (err) {
      console.error(`Failed to ${isEditing ? "update" : "create"} user:`, err);
      const responseData = err.response?.data;
      setError(
        responseData?.message ||
          responseData?.detail ||
          (responseData?.errors
            ? Object.values(responseData.errors).flat().join(" ")
            : responseData?.title) ||
          `Unable to ${isEditing ? "update" : "add"} this user.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="users-page">
      <div className="users-page-top">
        <Link to="/users" className="back-link">
          <ArrowLeft size={17} />
          Back to users
        </Link>
      </div>

      <div className="users-page-heading">
        <div>
          <h2>{isEditing ? "Edit User" : "Add User"}</h2>
          <p>
            {isEditing
              ? "Update this team member's details and account status."
              : "Create a team account that can be assigned to support tickets."}
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {userLoading ? (
        <div className="users-form">
          <div className="users-loading">Loading user...</div>
        </div>
      ) : (
      <form className="users-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="fullName">Full name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              maxLength={100}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={150}
              autoComplete="email"
              required
            />
          </div>

          {!isEditing && (
            <div className="form-field">
              <label htmlFor="password">Temporary password *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <span className="field-hint">At least 8 characters.</span>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Agent">Agent</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          {isEditing && (
            <label className="user-active-toggle">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    isActive: event.target.checked,
                  }))
                }
              />
              <span>Account is active</span>
            </label>
          )}
        </div>

        <div className="ticket-form-footer">
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/users")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            icon={isEditing ? Pencil : UserPlus}
            loading={loading}
            disabled={loading || userLoading || Boolean(error && isEditing && !formData.fullName)}
          >
            {isEditing ? "Save Changes" : "Add User"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}

export default AddUser;
