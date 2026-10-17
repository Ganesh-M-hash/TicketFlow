
using TicketFlow.Models;
using TicketFlow.Models.Requests;

namespace TicketFlow.Services.Interfaces;

public interface IUserService
{
    Task<PagedResult<User>> GetUsersAsync(
     string? search,
     string? role,
     int page,
     int pageSize);
    Task<User?> GetUserByIdAsync(int id);

    Task<User> CreateUserAsync(CreateUserRequest request);

    Task<bool> UpdateUserAsync(int id, User updatedUser);

    Task<bool> DeleteUserAsync(int id);
}
