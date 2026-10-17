
using Microsoft.AspNetCore.Mvc;
using TicketFlow.Models;
using TicketFlow.Services;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        // GET: api/Dashboard/summary
        [HttpGet("summary")]
        [ProducesResponseType(typeof(DashboardSummary), StatusCodes.Status200OK)]
        public async Task<ActionResult<DashboardSummary>> GetSummary()
        {
            var summary = await _dashboardService.GetSummaryAsync();

            return Ok(summary);
        }
    }
}
