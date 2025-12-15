namespace CloneNetflixApi.DTOs.User
{
    public class CreateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public string Password { get; set; } = string.Empty;
        public Guid? SubscriptionId { get; set; }
    }
}