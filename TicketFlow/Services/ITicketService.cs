using TicketFlow.Models;

namespace TicketFlow.Services.Interfaces
{
    public interface ITicketService
    {

        Task<PagedResult<Ticket>> GetTicketsAsync(
            string? search,
            TicketStatus? status,
            TicketPriority? priority,
            int page,
            int pageSize);


        Task<Ticket?> GetTicketByNumberAsync(string ticketNumber);

        Task<Ticket> CreateTicketAsync(Ticket ticket);

        Task<bool> UpdateTicketAsync(
            string ticketNumber,
            Ticket updatedTicket);

        Task<bool> DeleteTicketAsync(string ticketNumber);
    }
}
