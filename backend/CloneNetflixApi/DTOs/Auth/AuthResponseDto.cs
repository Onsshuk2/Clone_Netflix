public class AuthResponseDto
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public IList<string> Roles { get; set; } = new List<string>();
    public DateTime TokenExpires { get; set; }
}