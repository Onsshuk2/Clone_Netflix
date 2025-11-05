using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

public class ApplicationUser : IdentityUser
{
    [PersonalData]
    [MaxLength(100)]
    public string? DisplayName { get; set; }

    [MaxLength(512)]
    public string? ProfilePictureUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? SubscriptionId { get; set; }
    public Subscription? Subscription { get; set; }

    public ICollection<ViewingHistory> ViewingHistories { get; set; } = new List<ViewingHistory>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<WatchlistItem> Watchlist { get; set; } = new List<WatchlistItem>();
}
