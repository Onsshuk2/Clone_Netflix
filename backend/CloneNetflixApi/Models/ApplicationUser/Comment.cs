using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Comment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(1000)]
    public string Text { get; set; } = string.Empty; // Текст коментаря

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

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
