
using Microsoft.EntityFrameworkCore;
using TicketFlow.Models;

namespace TicketFlow.Data
{
    public class TicketFlowDbContext : DbContext
    {
        public TicketFlowDbContext(
            DbContextOptions<TicketFlowDbContext> options)
            : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.HasKey(t => t.Id);

                entity.HasIndex(t => t.TicketNumber)
                    .IsUnique();

                entity.Property(t => t.TicketNumber)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(t => t.Status)
                    .HasConversion<string>()
                    .HasMaxLength(30);

                entity.Property(t => t.Priority)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                entity.Property(t => t.RowVersion)
                    .IsRowVersion();

                entity.HasQueryFilter(t => !t.IsDeleted);
            });
        }
    }
}
