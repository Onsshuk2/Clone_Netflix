// --- Тимчасова заглушка ---
using System.ComponentModel.DataAnnotations;

public class Content
{
    public Guid Id { get; set; } // Primary key

    [MaxLength(200)]
    public string? Title { get; set; } // Назва фільму / серіалу (щоб було зручно тестувати)
}
