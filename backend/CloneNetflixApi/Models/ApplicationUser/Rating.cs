using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Rating
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Range(1, 10)]
    public int Score { get; set; } // Наприклад: оцінка від 1 до 10

    public DateTime RatedAt { get; set; } = DateTime.UtcNow;

    // --- Зв’язок "Багато-до-Одного" з ApplicationUser ---
    [Required]
    public string ApplicationUserId { get; set; } = string.Empty;

    [ForeignKey(nameof(ApplicationUserId))]
    public ApplicationUser ApplicationUser { get; set; } = null!;

    // --- Зв’язок "Багато-до-Одного" з Content ---
    [Required]
    public Guid ContentId { get; set; }

    [ForeignKey(nameof(ContentId))]
    public Content Content { get; set; } = null!;
}
