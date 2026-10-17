import api from "./api";

const resolveUserName = (result) => {
  if (result?.fullName) return result.fullName;
  if (result?.name) return result.name;
  if (result?.email) return result.email.split("@")[0];
  return "User";
};

const login = async ({ email, password }) => {
  const response = await api.post("/auth/login", {
    email: email.trim(),
    password,
  });

  const result = response.data;
  if (!result?.token) {
    throw new Error(
      "The login API did not return an access token. Please check the backend login response."
    );
  }

  return {
    token: result.token,
    user: {
      id: result.userId ?? result.id,
      fullName: resolveUserName(result),
      name: resolveUserName(result),
      email: result.email,
      role: result.role,
    },
  };
};

const logout = async () => {
  await api.post("/auth/logout");
};

const authService = { login, logout };

export default authService;