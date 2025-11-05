using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
/// <summary>
/// Фактична підписка, що належить користувачу.
/// </summary>
public class Subscription
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    // --- Зв'язок "Один-до-Одного" з User ---
    [Required]
    public string ApplicationUserId { get; set; } // Ключ з IdentityUser (string)
    [ForeignKey("ApplicationUserId")]
    public ApplicationUser ApplicationUser { get; set; } = null!;

    // --- Зв'язок "Багато-до-Одного" з Plan ---
    [Required]
    public Guid SubscriptionPlanId { get; set; }
    [ForeignKey("SubscriptionPlanId")]
    public SubscriptionPlan Plan { get; set; } = null!;
}