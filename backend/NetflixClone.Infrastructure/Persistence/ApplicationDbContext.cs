using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<UserSubscription> UserSubscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // 1. Конфігурація SubscriptionPlan
        builder.Entity<SubscriptionPlan>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(50);
            entity.Property(p => p.Price).HasPrecision(18, 2);
        });

        // 2. Конфігурація UserSubscription (Зв'язуюча таблиця)
        builder.Entity<UserSubscription>(entity =>
        {
            entity.HasKey(us => us.Id);

            entity.HasOne(us => us.User)
                .WithMany(u => u.Subscriptions)
                .HasForeignKey(us => us.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(us => us.Plan)
                .WithMany(p => p.UserSubscriptions)
                .HasForeignKey(us => us.PlanId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // 3. Додаткові налаштування для User
        builder.Entity<User>(entity =>
        {
            entity.ToTable("AspNetUsers");
            entity.Property(u => u.DateOfBirth).IsRequired();
        });
    }
}