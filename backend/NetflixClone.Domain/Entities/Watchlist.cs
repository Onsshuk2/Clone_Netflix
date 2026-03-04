using NetflixClone.Domain.Common;

namespace NetflixClone.Domain.Entities;

public class Watchlist : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ContentId { get; set; }
    public Content Content { get; set; } = null!;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    public bool IsWatched { get; set; } = false;
    public DateTime? WatchedAt { get; set; }
    
    public int Position { get; set; } // для сортування
}