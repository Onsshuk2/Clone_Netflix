// --- Тимчасова заглушка ---
using System.ComponentModel.DataAnnotations;

public class Content
{
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string? Title { get; set; } 
}
