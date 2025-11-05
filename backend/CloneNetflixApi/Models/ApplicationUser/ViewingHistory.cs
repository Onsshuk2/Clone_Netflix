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
    public Guid ContentId { get; set; } // Посилання на фільм / серіал / аніме
    [ForeignKey("ContentId")]
    public Content Content { get; set; } = null!; // Навігаційна властивість

    [Required]
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow; // коли переглянуто

    // Опціональні поля
    public TimeSpan? WatchedDuration { get; set; } // скільки часу переглянув
    public double? ProgressPercentage { get; set; } // % переглянутого (0–100)
}
