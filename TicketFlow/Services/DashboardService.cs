
using Microsoft.EntityFrameworkCore;
using TicketFlow.Data;
using TicketFlow.Models;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly TicketFlowDbContext _context;

        public DashboardService(TicketFlowDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummary> GetSummaryAsync()
        {
            var tickets = _context.Tickets.AsNoTracking();

            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);
            var trendStart = today.AddDays(-6);

            var summary = new DashboardSummary
            {
                // Summary cards
                TotalTickets = await tickets.CountAsync(),

                OpenTickets = await tickets.CountAsync(
                    t => t.Status == TicketStatus.Open),

                InProgressTickets = await tickets.CountAsync(
                    t => t.Status == TicketStatus.InProgress),

                ResolvedTickets = await tickets.CountAsync(
                    t => t.Status == TicketStatus.Resolved),

                ClosedTickets = await tickets.CountAsync(
                    t => t.Status == TicketStatus.Closed),

                CriticalTickets = await tickets.CountAsync(
                    t => t.Priority == TicketPriority.Critical),

                HighPriorityTickets = await tickets.CountAsync(
                    t => t.Priority == TicketPriority.High),

                UnassignedTickets = await tickets.CountAsync(
                    t => t.AssignedTo == null ||
                         t.AssignedTo.Trim() == ""),

                ResolvedToday = await tickets.CountAsync(
                    t => t.ResolvedAt >= today &&
                         t.ResolvedAt < tomorrow),

                // Priority breakdown
                LowPriorityTickets = await tickets.CountAsync(
                    t => t.Priority == TicketPriority.Low),

                MediumPriorityTickets = await tickets.CountAsync(
                    t => t.Priority == TicketPriority.Medium)
            };

            // Latest 5 tickets
            summary.RecentTickets = await tickets
                .OrderByDescending(t => t.CreatedAt)
                .Take(5)
                .Select(t => new RecentTicket
                {
                    TicketNumber = t.TicketNumber,
                    Title = t.Title,
                    RequesterName = t.RequesterName,
                    Priority = t.Priority,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    AssignedTo = t.AssignedTo
                })
                .ToListAsync();

            // Load tickets created or resolved during the last 7 calendar days.
            var trendTickets = await tickets
                .Where(t =>
                    (t.CreatedAt >= trendStart && t.CreatedAt < tomorrow) ||
                    (t.ResolvedAt >= trendStart && t.ResolvedAt < tomorrow))
                .Select(t => new
                {
                    t.CreatedAt,
                    t.ResolvedAt
                })
                .ToListAsync();

            // Include days with zero tickets.
            for (var i = 0; i < 7; i++)
            {
                var date = trendStart.AddDays(i);
                var nextDate = date.AddDays(1);

                summary.TicketTrends.Add(new DailyTicketTrend
                {
                    Date = date,

                    CreatedCount = trendTickets.Count(t =>
                        t.CreatedAt >= date &&
                        t.CreatedAt < nextDate),

                    ResolvedCount = trendTickets.Count(t =>
                        t.ResolvedAt.HasValue &&
                        t.ResolvedAt.Value >= date &&
                        t.ResolvedAt.Value < nextDate)
                });
            }

            return summary;
        }
    }
}
