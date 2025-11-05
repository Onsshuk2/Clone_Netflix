using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Favorite
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

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

    public DateTime AddedAt { get; set; } = DateTime.UtcNow; // Коли додано в улюблені
}
