
using TicketFlow.Models;

namespace TicketFlow.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummary> GetSummaryAsync();
    }
}
