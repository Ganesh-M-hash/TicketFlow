
using Microsoft.EntityFrameworkCore;
using TicketFlow.Data;
using TicketFlow.Models;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Services
{
    public class TicketService : ITicketService
    {
        private readonly TicketFlowDbContext _context;

        public TicketService(TicketFlowDbContext context)
        {
            _context = context;
        }


        public async Task<PagedResult<Ticket>> GetTicketsAsync(
            string? search,
            TicketStatus? status,
            TicketPriority? priority,
            int page,
            int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            IQueryable<Ticket> query = _context.Tickets
                .AsNoTracking()
                .Where(t => !t.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.Trim();

                query = query.Where(t =>
                    t.TicketNumber.Contains(searchTerm) ||
                    t.Title.Contains(searchTerm) ||
                    t.RequesterName.Contains(searchTerm) ||
                    t.RequesterEmail.Contains(searchTerm));
            }

            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == priority.Value);
            }

            // Count records after applying search and filters.
            var totalCount = await query.CountAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize);

            // Fetch only the requested page from PostgreSQL.
            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .ThenByDescending(t => t.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Ticket>
            {
                Items = tickets,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }

        public async Task<Ticket?> GetTicketByNumberAsync(
            string ticketNumber)
        {
            return await _context.Tickets
                .FirstOrDefaultAsync(t =>
                    t.TicketNumber == ticketNumber);
        }

        public async Task<Ticket> CreateTicketAsync(Ticket ticket)
        {
            ticket.Id = 0;
            ticket.TicketNumber = await GenerateTicketNumberAsync();
            ticket.CreatedAt = DateTime.UtcNow;
            ticket.UpdatedAt = null;
            ticket.ResolvedAt = null;
            ticket.IsDeleted = false;
            ticket.Status = TicketStatus.Open;

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return ticket;
        }

        public async Task<bool> UpdateTicketAsync(
            string ticketNumber,
            Ticket updatedTicket)
        {
            var ticket = await GetTicketByNumberAsync(ticketNumber);

            if (ticket == null)
                return false;

            ticket.Title = updatedTicket.Title;
            ticket.Description = updatedTicket.Description;
            ticket.Category = updatedTicket.Category;
            ticket.Priority = updatedTicket.Priority;
            ticket.Status = updatedTicket.Status;
            ticket.RequesterName = updatedTicket.RequesterName;
            ticket.RequesterEmail = updatedTicket.RequesterEmail;
            ticket.AssignedTo = updatedTicket.AssignedTo;
            ticket.AssignedToEmail = updatedTicket.AssignedToEmail;
            ticket.UpdatedAt = DateTime.UtcNow;

            if (ticket.Status == TicketStatus.Resolved ||
                ticket.Status == TicketStatus.Closed)
            {
                ticket.ResolvedAt ??= DateTime.UtcNow;
            }
            else
            {
                ticket.ResolvedAt = null;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteTicketAsync(string ticketNumber)
        {
            var ticket = await GetTicketByNumberAsync(ticketNumber);

            if (ticket == null)
                return false;

            ticket.IsDeleted = true;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<string> GenerateTicketNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"TKT-{year}-";

            var existingNumbers = await _context.Tickets
                .IgnoreQueryFilters()
                .Where(t => t.TicketNumber.StartsWith(prefix))
                .Select(t => t.TicketNumber)
                .ToListAsync();

            var highestNumber = existingNumbers
                .Select(number =>
                {
                    var parts = number.Split('-');

                    return parts.Length == 3 &&
                           int.TryParse(parts[2], out var sequence)
                        ? sequence
                        : 0;
                })
                .DefaultIfEmpty(0)
                .Max();

            return $"{prefix}{highestNumber + 1:D5}";
        }
    }
}