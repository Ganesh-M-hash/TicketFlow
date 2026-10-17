
using Microsoft.EntityFrameworkCore;
using TicketFlow.Data;
using TicketFlow.Models;
using TicketFlow.Models.Requests;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Services;

public class UserService : IUserService
{
    private readonly TicketFlowDbContext _context;

    public UserService(TicketFlowDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<User>> GetUsersAsync(
        string? search,
        string? role,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        IQueryable<User> query = _context.Users
            .AsNoTracking()
            .Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();

            query = query.Where(u =>
                u.FullName.Contains(searchTerm) ||
                u.Email.Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => u.Role == role);
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.FullName)
            .ThenBy(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<User>
        {
            Items = users,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize)
        };
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u =>
                u.Id == id && !u.IsDeleted);
    }

    public async Task<User> CreateUserAsync(
        CreateUserRequest request)
    {
        var email = request.Email.Trim();

        var emailExists = await _context.Users
            .AnyAsync(u =>
                u.Email.ToLower() == email.ToLower());

        if (emailExists)
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password),
            Role = request.Role,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<bool> UpdateUserAsync(
        int id,
        User updatedUser)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == id && !u.IsDeleted);

        if (user == null)
            return false;

        var email = updatedUser.Email.Trim();

        var emailExists = await _context.Users
            .AnyAsync(u =>
                u.Id != id &&
                !u.IsDeleted &&
                u.Email.ToLower() == email.ToLower());

        if (emailExists)
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        user.FullName = updatedUser.FullName.Trim();
        user.Email = email;
        user.Role = updatedUser.Role;
        user.IsActive = updatedUser.IsActive;

        // PasswordHash, Id, CreatedAt and IsDeleted
        // are intentionally not updated from the request.

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == id && !u.IsDeleted);

        if (user == null)
            return false;

        user.IsDeleted = true;
        user.IsActive = false;

        await _context.SaveChangesAsync();

        return true;
    }
}
