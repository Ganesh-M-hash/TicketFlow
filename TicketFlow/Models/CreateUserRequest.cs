
using System.ComponentModel.DataAnnotations;

namespace TicketFlow.Models.Requests;

public class CreateUserRequest
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(Administrator|Manager|Agent)$")]
    public string Role { get; set; } = "Agent";
}
