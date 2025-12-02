using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    public bool IsAvailable { get; set; } = true;

    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}