
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketFlow.Models;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            return Ok(result);
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // JWT logout is completed by removing the token on the frontend.
            return Ok(new
            {
                message = "Logged out successfully."
            });
        }
    }
}
