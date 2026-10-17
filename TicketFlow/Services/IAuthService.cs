using TicketFlow.Models;

namespace TicketFlow.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request);
    }
}