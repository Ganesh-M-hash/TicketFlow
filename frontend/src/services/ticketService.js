import api from "./api";

const getTickets = async (filters = {}) => {
  const response = await api.get("/tickets", {
    params: filters,
  });

  return response.data;
};

const getTicketByNumber = async (ticketNumber) => {
  const response = await api.get(`/tickets/${ticketNumber}`);
  return response.data;
};

const createTicket = async (ticket) => {
  const response = await api.post("/tickets", ticket);
  return response.data;
};

const updateTicket = async (ticketNumber, ticket) => {
  const response = await api.put(`/tickets/${ticketNumber}`, ticket);
  return response.data;
};

const deleteTicket = async (ticketNumber) => {
  const response = await api.delete(`/tickets/${ticketNumber}`);
  return response.data;
};

const ticketService = {
  getTickets,
  getTicketByNumber,
  createTicket,
  updateTicket,
  deleteTicket,
};

export default ticketService;
