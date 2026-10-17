
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using TicketFlow.Models;
using TicketFlow.Models.Requests;
using TicketFlow.Services.Interfaces;

namespace TicketFlow.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Administrator")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
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

        var result = await _userService.GetUsersAsync(
            search, role, page, pageSize);

        return Ok(new
        {
            result.Page,
            result.PageSize,
            result.TotalCount,
            result.TotalPages,
            result.HasPreviousPage,
            result.HasNextPage,
            Items = result.Items.Select(ToSafeUser)
        });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(ToSafeUser(user));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateUserRequest request)
    {
        try
        {
            var user = await _userService.CreateUserAsync(request);

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                ToSafeUser(user));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(
        int id,
        [FromBody] User updatedUser)
    {
        try
        {
            var updated = await _userService.UpdateUserAsync(
                id, updatedUser);

            if (!updated)
                return NotFound(new { message = "User not found." });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userService.DeleteUserAsync(id);

        if (!deleted)
            return NotFound(new { message = "User not found." });

        return NoContent();
    }

    private static object ToSafeUser(User user)
    {
        return new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.IsActive,
            user.CreatedAt
        };
    }
}
