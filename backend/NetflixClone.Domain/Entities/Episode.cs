using NetflixClone.Domain.Common;

namespace NetflixClone.Domain.Entities;

public class Episode : BaseEntity
{
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public int Duration { get; set; }
    public Guid ContentId { get; set; }
    public virtual Content Content { get; set; } = null!;
}