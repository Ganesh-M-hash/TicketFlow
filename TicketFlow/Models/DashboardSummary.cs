
namespace TicketFlow.Models
{
    public class DashboardSummary
    {
        // Summary cards
        public int TotalTickets { get; set; }
        public int OpenTickets { get; set; }
        public int InProgressTickets { get; set; }
        public int ResolvedTickets { get; set; }
        public int ClosedTickets { get; set; }
        public int CriticalTickets { get; set; }
        public int HighPriorityTickets { get; set; }
        public int UnassignedTickets { get; set; }
        public int ResolvedToday { get; set; }

        // Priority breakdown
        public int LowPriorityTickets { get; set; }
        public int MediumPriorityTickets { get; set; }

        // Recent tickets
        public List<RecentTicket> RecentTickets { get; set; } = new();

        // Last 7 days
        public List<DailyTicketTrend> TicketTrends { get; set; } = new();
    }

    public class RecentTicket
    {
        public string TicketNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string RequesterName { get; set; } = string.Empty;
        public TicketPriority Priority { get; set; }
        public TicketStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AssignedTo { get; set; }
    }

    public class DailyTicketTrend
    {
        public DateTime Date { get; set; }
        public int CreatedCount { get; set; }
        public int ResolvedCount { get; set; }
    }
}
