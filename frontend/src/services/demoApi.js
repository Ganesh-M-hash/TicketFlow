import axios from "axios";

const STORAGE_KEY = "ticketflow.demo.data.v1";
const DEMO_EMAIL = "admin@ticketflow.demo";
const DEMO_PASSWORD = "TicketFlowDemo!2026";
const DEMO_ADMIN = {
  id: 1,
  fullName: "Admin User",
  email: DEMO_EMAIL,
  role: "Administrator",
  isActive: true,
  createdAt: new Date().toISOString(),
};
const AGENT_NAMES = [
  "Abigail Lewis", "Alexander Parker", "Amelia Green", "Ava Cooper",
  "Benjamin Lee", "Chloe Walker", "Daniel Harris", "Emily Clark",
  "Ethan Wright", "Grace Mitchell", "Henry Turner", "Isabella Scott",
  "Jack Anderson", "Lily Thomas", "Lucas Martin", "Mia Robinson",
  "Noah Hall", "Olivia Young", "Oliver King", "Sophia Baker",
  "William Adams", "Ella Nelson", "James Carter", "Harper Evans",
  "Mason Collins",
];
const TICKET_TITLES = [
  "Unable to access account",
  "Laptop keeps restarting",
  "Request to install approved software",
  "VPN connection drops frequently",
  "Email attachments are not loading",
  "Printer is offline",
  "Permission needed for shared folder",
  "Slow application response",
  "Password reset assistance",
  "Meeting room display is not working",
];
const CATEGORIES = ["Account", "Hardware", "Software", "Network", "Other"];
const PRIORITY_NAMES = ["Low", "Medium", "High", "Critical"];
const STATUS_NAMES = ["Open", "InProgress", "Resolved", "Closed"];

function createInitialData() {
  const users = [
    DEMO_ADMIN,
    ...AGENT_NAMES.map((fullName, index) => ({
      id: index + 2,
      fullName,
      email: `ticketflow.demo.agent${String(index + 1).padStart(2, "0")}@example.com`,
      role: "Agent",
      isActive: true,
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    })),
  ];
  const agents = users.slice(1);
  const tickets = Array.from({ length: 205 }, (_, index) => {
    const ageInDays = index % 14;
    const assignedUser = index % 3 === 0 ? agents[index % agents.length] : null;

    return {
      id: index + 1,
      ticketNumber: `TKT-2026-${String(205 - index).padStart(5, "0")}`,
      title: TICKET_TITLES[index % TICKET_TITLES.length],
      description: "Sample support request for exploring the TicketFlow demo.",
      category: CATEGORIES[index % CATEGORIES.length],
      priority: index % PRIORITY_NAMES.length,
      status: index === 0 ? 1 : index === 1 ? 2 : 0,
      requesterName: `Demo Requester ${index + 1}`,
      requesterEmail: `requester${index + 1}@example.com`,
      assignedTo: assignedUser?.fullName ?? null,
      assignedToEmail: assignedUser?.email ?? null,
      createdAt: new Date(Date.now() - ageInDays * 86400000).toISOString(),
      updatedAt: null,
      resolvedAt: index === 1 ? new Date().toISOString() : null,
      isDeleted: false,
    };
  });

  return { users, tickets, nextUserId: users.length + 1 };
}

function readData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    const initialData = createInitialData();
    writeData(initialData);
    return initialData;
  }

  const data = JSON.parse(stored);
  if (!Array.isArray(data.users) || !Array.isArray(data.tickets)) {
    throw new Error("The saved demo data is invalid. Clear this site's demo data to reset it.");
  }
  return data;
}

function writeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function apiError(config, status, message) {
  return new axios.AxiosError(message, axios.AxiosError.ERR_BAD_REQUEST, config, null, {
    data: { message },
    status,
    statusText: status === 404 ? "Not Found" : "Bad Request",
    headers: {},
    config,
    request: null,
  });
}

function bodyOf(config) {
  if (typeof config.data !== "string") return config.data ?? {};
  try {
    return JSON.parse(config.data);
  } catch {
    throw apiError(config, 400, "The request body is not valid JSON.");
  }
}

function enumValue(value, names) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (/^\d+$/.test(String(value))) return Number(value);
  return names.findIndex((name) => name.toLowerCase() === String(value).toLowerCase());
}

function paged(items, params = {}) {
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return null;
  }
  const totalPages = Math.ceil(items.length / pageSize);
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalCount: items.length,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function dashboardSummary(tickets) {
  const activeTickets = tickets.filter((ticket) => !ticket.isDeleted);
  const countStatus = (status) => activeTickets.filter((ticket) => ticket.status === status).length;
  const countPriority = (priority) => activeTickets.filter((ticket) => ticket.priority === priority).length;
  const today = new Date().toISOString().slice(0, 10);
  const ticketTrends = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const day = date.toISOString().slice(0, 10);
    const dayTickets = activeTickets.filter((ticket) => ticket.createdAt.slice(0, 10) === day);
    return {
      date: `${day}T00:00:00.000Z`,
      createdCount: dayTickets.length,
      resolvedCount: dayTickets.filter(
        (ticket) => ticket.resolvedAt?.slice(0, 10) === day
      ).length,
    };
  });

  return {
    totalTickets: activeTickets.length,
    openTickets: countStatus(0),
    inProgressTickets: countStatus(1),
    resolvedTickets: countStatus(2),
    closedTickets: countStatus(3),
    criticalTickets: countPriority(3),
    highPriorityTickets: countPriority(2),
    lowPriorityTickets: countPriority(0),
    mediumPriorityTickets: countPriority(1),
    unassignedTickets: activeTickets.filter((ticket) => !ticket.assignedTo).length,
    resolvedToday: activeTickets.filter((ticket) => ticket.resolvedAt?.slice(0, 10) === today).length,
    recentTickets: [...activeTickets]
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
      .slice(0, 5)
      .map((ticket) => ({
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        requesterName: ticket.requesterName,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        assignedTo: ticket.assignedTo,
      })),
    ticketTrends,
  };
}

function createTicketNumber(data) {
  const latest = data.tickets.reduce((maximum, ticket) => {
    const suffix = Number(ticket.ticketNumber.split("-").at(-1));
    return Number.isFinite(suffix) ? Math.max(maximum, suffix) : maximum;
  }, 0);
  return `TKT-2026-${String(latest + 1).padStart(5, "0")}`;
}

function handleRequest(config) {
  const method = (config.method ?? "get").toUpperCase();
  const requestPath = `/${[config.baseURL ?? "", config.url ?? ""]
    .join("/")
    .replace(/^\/+|\/+$/g, "")}`;
  const path = requestPath.replace(/\/+/g, "/").replace(/^\/api(?=\/|$)/, "") || "/";
  const params = config.params ?? {};
  const body = bodyOf(config);

  if (method === "POST" && path === "/auth/login") {
    const email = String(body.email ?? "").trim().toLowerCase();
    if (email !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) {
      throw apiError(config, 401, "Invalid demo email or password.");
    }
    return {
      token: "ticketflow-local-demo-token",
      userId: DEMO_ADMIN.id,
      fullName: DEMO_ADMIN.fullName,
      email: DEMO_ADMIN.email,
      role: DEMO_ADMIN.role,
    };
  }
  if (method === "POST" && path === "/auth/logout") return null;

  const data = readData();

  if (method === "GET" && path === "/dashboard/summary") {
    return dashboardSummary(data.tickets);
  }

  if (path === "/tickets" && method === "GET") {
    let tickets = data.tickets.filter((ticket) => !ticket.isDeleted);
    const search = String(params.search ?? "").trim().toLowerCase();
    if (search) {
      tickets = tickets.filter((ticket) =>
        [ticket.ticketNumber, ticket.title, ticket.description, ticket.requesterName, ticket.requesterEmail]
          .some((value) => value?.toLowerCase().includes(search))
      );
    }
    if (params.status) {
      tickets = tickets.filter((ticket) => ticket.status === enumValue(params.status, STATUS_NAMES));
    }
    if (params.priority) {
      tickets = tickets.filter((ticket) => ticket.priority === enumValue(params.priority, PRIORITY_NAMES));
    }
    const result = paged(
      tickets.sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
      params
    );
    if (!result) throw apiError(config, 400, "Invalid page or page size.");
    return result;
  }

  const ticketMatch = path.match(/^\/tickets\/(.+)$/);
  if (ticketMatch) {
    const ticket = data.tickets.find(
      (item) => item.ticketNumber === decodeURIComponent(ticketMatch[1]) && !item.isDeleted
    );
    if (!ticket && method !== "POST") throw apiError(config, 404, "Ticket not found.");

    if (method === "GET") return ticket;
    if (method === "PUT") {
      Object.assign(ticket, body, {
        updatedAt: new Date().toISOString(),
        priority: enumValue(body.priority, PRIORITY_NAMES),
        status: enumValue(body.status, STATUS_NAMES),
      });
      writeData(data);
      return null;
    }
    if (method === "DELETE") {
      ticket.isDeleted = true;
      writeData(data);
      return null;
    }
  }

  if (path === "/tickets" && method === "POST") {
    const ticket = {
      ...body,
      id: data.tickets.reduce((maximum, item) => Math.max(maximum, item.id), 0) + 1,
      ticketNumber: createTicketNumber(data),
      priority: enumValue(body.priority ?? 1, PRIORITY_NAMES),
      status: enumValue(body.status ?? 0, STATUS_NAMES),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      resolvedAt: null,
      isDeleted: false,
    };
    data.tickets.push(ticket);
    writeData(data);
    return ticket;
  }

  if (path === "/users" && method === "GET") {
    let users = data.users.filter((user) => !user.isDeleted);
    const search = String(params.search ?? "").trim().toLowerCase();
    if (search) {
      users = users.filter((user) =>
        `${user.fullName} ${user.email}`.toLowerCase().includes(search)
      );
    }
    if (params.role) users = users.filter((user) => user.role === params.role);
    const result = paged(users.sort((first, second) => first.fullName.localeCompare(second.fullName)), params);
    if (!result) throw apiError(config, 400, "Invalid page or page size.");
    return result;
  }

  const userMatch = path.match(/^\/users\/(\d+)$/);
  if (userMatch) {
    const user = data.users.find((item) => item.id === Number(userMatch[1]) && !item.isDeleted);
    if (!user && method !== "POST") throw apiError(config, 404, "User not found.");
    if (method === "GET") return user;
    if (method === "PUT") {
      const duplicate = data.users.some(
        (item) => item.id !== user.id && !item.isDeleted && item.email.toLowerCase() === String(body.email).toLowerCase()
      );
      if (duplicate) throw apiError(config, 409, "A user with this email already exists.");
      Object.assign(user, {
        fullName: String(body.fullName ?? user.fullName).trim(),
        email: String(body.email ?? user.email).trim(),
        role: body.role ?? user.role,
        isActive: Boolean(body.isActive),
      });
      writeData(data);
      return null;
    }
    if (method === "DELETE") {
      user.isDeleted = true;
      writeData(data);
      return null;
    }
  }

  if (path === "/users" && method === "POST") {
    const email = String(body.email ?? "").trim();
    if (data.users.some((user) => !user.isDeleted && user.email.toLowerCase() === email.toLowerCase())) {
      throw apiError(config, 409, "A user with this email already exists.");
    }
    const user = {
      id: data.nextUserId++,
      fullName: String(body.fullName ?? "").trim(),
      email,
      role: body.role ?? "Agent",
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    writeData(data);
    return user;
  }

  throw apiError(config, 404, `The demo API does not support ${method} ${path}.`);
}

export default async function demoApiAdapter(config) {
  try {
    const response = {
      data: handleRequest(config),
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      request: null,
    };
    return response;
  } catch (error) {
    if (error instanceof axios.AxiosError) throw error;
    throw new axios.AxiosError(
      error.message || "The browser could not access local demo storage.",
      axios.AxiosError.ERR_BAD_RESPONSE,
      config
    );
  }
}
