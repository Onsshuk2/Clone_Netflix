using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // --- Таблиці користувачів ---
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Rating> Ratings { get; set; }
    public DbSet<ViewingHistory> ViewingHistories { get; set; }
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<WatchlistItem> Watchlist { get; set; }

    // --- Таблиці контенту (тимчасово з заглушкою) ---
    public DbSet<Content> Contents { get; set; }

    // --- Таблиці підписок ---
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // --- 1 до 1: Користувач ↔ Підписка ---
        builder.Entity<ApplicationUser>()
            .HasOne(u => u.Subscription)
            .WithOne(s => s.ApplicationUser)
            .HasForeignKey<Subscription>(s => s.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- 1 до багатьох: Користувач ↔ Історія переглядів ---
        builder.Entity<ViewingHistory>()
            .HasOne(v => v.ApplicationUser)
            .WithMany(u => u.ViewingHistories)
            .HasForeignKey(v => v.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- 1 до багатьох: Користувач ↔ Коментарі ---
        builder.Entity<Comment>()
            .HasOne(c => c.ApplicationUser)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- 1 до багатьох: Користувач ↔ Рейтинги ---
        builder.Entity<Rating>()
            .HasOne(r => r.ApplicationUser)
            .WithMany(u => u.Ratings)
            .HasForeignKey(r => r.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- Багато до багатьох (через проміжну таблицю): Favorites ---
        builder.Entity<Favorite>()
            .HasOne(f => f.ApplicationUser)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Favorite>()
            .HasOne(f => f.Content)
            .WithMany()
            .HasForeignKey(f => f.ContentId)
            .OnDelete(DeleteBehavior.Cascade);

        // --- Багато до багатьох (через проміжну таблицю): Watchlist ---
        builder.Entity<WatchlistItem>()
            .HasOne(w => w.ApplicationUser)
            .WithMany(u => u.Watchlist)
            .HasForeignKey(w => w.ApplicationUserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WatchlistItem>()
            .HasOne(w => w.Content)
            .WithMany()
            .HasForeignKey(w => w.ContentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
