public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? SubscriptionName { get; set; }
    public List<string> Roles { get; set; } = new();
}