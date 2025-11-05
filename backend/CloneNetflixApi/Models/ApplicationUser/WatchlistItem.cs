using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Контент, який користувач додав у список "На потім".
/// </summary>
public class WatchlistItem
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

    // --- Додаткові поля ---
    public DateTime AddedAt { get; set; } = DateTime.UtcNow; // коли додано
    public bool IsWatched { get; set; } = false; // позначити, якщо вже переглянуто
}
