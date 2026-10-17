import api from "./api";

const getUsers = async (params = {}) => {
  const response = await api.get("/users", { params });
  return response.data;
};

const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

const getAllUsers = async () => {
  const pageSize = 100;
  const firstPage = await getUsers({ page: 1, pageSize });

  if (!Array.isArray(firstPage?.items) || !Number.isInteger(firstPage.totalPages)) {
    throw new Error("The users API returned an invalid paged response.");
  }

  const users = [...firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await getUsers({ page, pageSize });

    if (!Array.isArray(result?.items)) {
      throw new Error(`The users API returned an invalid response for page ${page}.`);
    }

    users.push(...result.items);
  }

  return users;
};

const createUser = async (user) => {
  const response = await api.post("/users", user);
  return response.data;
};

const updateUser = async (id, user) => {
  await api.put(`/users/${id}`, {
    ...user,
    // The backend binds its User entity and requires this field, but ignores it on updates.
    passwordHash: "unchanged",
  });
};

const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};

const userService = {
  getUsers,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
