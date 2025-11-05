using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Тарифний план (Basic, Premium), яким керує адмін.
/// </summary>
public class SubscriptionPlan
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required]
    public VideoQuality Quality { get; set; }

    [Required]
    public int MaxDevices { get; set; }

    // Дозволяє адміну "вимкнути" план, не видаляючи його
    public bool IsAvailable { get; set; } = true;

    // 1-до-багатьох: Один План має багато активних Підписок
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}