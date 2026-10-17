
using Microsoft.AspNetCore.Mvc;
using TicketFlow.Models;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        // GET: api/tickets

        [HttpGet]
        public async Task<ActionResult<PagedResult<Ticket>>> GetTickets(
            [FromQuery] string? search = null,
            [FromQuery] TicketStatus? status = null,
            [FromQuery] TicketPriority? priority = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1)
                return BadRequest(new { message = "Page must be at least 1." });

            if (pageSize < 1 || pageSize > 100)
                return BadRequest(new
                {
                    message = "Page size must be between 1 and 100."
                });

            var result = await _ticketService.GetTicketsAsync(
                search, status, priority, page, pageSize);

            return Ok(result);
        }


        // GET: api/tickets/TKT-2026-00001
        [HttpGet("{ticketNumber}")]
        public async Task<ActionResult<Ticket>> GetTicket(
            string ticketNumber)
        {
            var ticket = await _ticketService
                .GetTicketByNumberAsync(ticketNumber);

            if (ticket == null)
            {
                return NotFound(new { message = "Ticket not found." });
            }

            return Ok(ticket);
        }

        // POST: api/tickets
        [HttpPost]
        public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
        {
            var createdTicket = await _ticketService.CreateTicketAsync(ticket);

            return CreatedAtAction(
                nameof(GetTicket),
                new { ticketNumber = createdTicket.TicketNumber },
                createdTicket);
        }

        // PUT: api/tickets/TKT-2026-00001
        [HttpPut("{ticketNumber}")]
        public async Task<IActionResult> UpdateTicket(
            string ticketNumber,
            Ticket ticket)
        {
            var updated = await _ticketService.UpdateTicketAsync(
                ticketNumber, ticket);

            if (!updated)
            {
                return NotFound(new { message = "Ticket not found." });
            }

            return NoContent();
        }

        // DELETE: api/tickets/TKT-2026-00001
        [HttpDelete("{ticketNumber}")]
        public async Task<IActionResult> DeleteTicket(string ticketNumber)
        {
            var deleted = await _ticketService
                .DeleteTicketAsync(ticketNumber);

            if (!deleted)
            {
                return NotFound(new { message = "Ticket not found." });
            }

            return NoContent();
        }
    }
}
