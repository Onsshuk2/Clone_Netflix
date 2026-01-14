using Microsoft.AspNetCore.Identity;
using NetflixClone.Domain.Common;

namespace NetflixClone.Domain.Entities;

// Оскільки немає множиного наслідування прийшлось CreatedAt й UpdatedAt прописати тут. Нададі є базовий клас BaseIdentity
public class User : IdentityUser<Guid>
{
    public DateTime DateOfBirth { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }
    
    // Temporary
    public string SubscribtionPlan { get; set; } = "free";
    public string? AvatarUrl { get; set; }
}
