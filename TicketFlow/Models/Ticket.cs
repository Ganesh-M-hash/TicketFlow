
using System.ComponentModel.DataAnnotations;

namespace TicketFlow.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        [Required]
        [StringLength(30)]
        public string TicketNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        public TicketPriority Priority { get; set; }
            = TicketPriority.Medium;

        public TicketStatus Status { get; set; }
            = TicketStatus.Open;

        [Required]
        [StringLength(150)]
        public string RequesterName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(254)]
        public string RequesterEmail { get; set; } = string.Empty;

        [StringLength(150)]
        public string? AssignedTo { get; set; }

        [EmailAddress]
        [StringLength(254)]
        public string? AssignedToEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ResolvedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }

    public enum TicketStatus
    {
        Open,
        InProgress,
        Resolved,
        Closed
    }

    public enum TicketPriority
    {
        Low,
        Medium,
        High,
        Critical
    }
}
