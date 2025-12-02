using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class ViewingHistory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string ApplicationUserId { get; set; } = null!;

    [ForeignKey("ApplicationUserId")]
    public ApplicationUser ApplicationUser { get; set; } = null!;

    [Required]
    public Guid ContentId { get; set; }
    [ForeignKey("ContentId")]
    public Content Content { get; set; } = null!;

    [Required]
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

    public TimeSpan? WatchedDuration { get; set; }
    public double? ProgressPercentage { get; set; } 
}
