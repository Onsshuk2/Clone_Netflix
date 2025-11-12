using CloneNetflixApi.Models;

namespace CloneNetflixApi.Services.AuthService
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto);
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto);
        Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
    }
}
