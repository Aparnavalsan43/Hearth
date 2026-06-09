using Hearth.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<Bill> Bills { get; set; }

    public DbSet<Reminder> Reminders { get; set; }

    public DbSet<Meal> Meals { get; set; }

    public DbSet<ShoppingItem> ShoppingItems { get; set; }

    public DbSet<Chore> Chores { get; set; }

    public DbSet<Notification> Notifications { get; set; }

    public DbSet<HouseholdMember> HouseholdMembers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Chore>()
            .HasOne(chore => chore.AssignedToMember)
            .WithMany()
            .HasForeignKey(chore => chore.AssignedToMemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
