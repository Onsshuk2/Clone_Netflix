using CloneNetflixApi.Models;
using Core.Models.Account;

namespace CloneNetflixApi.Services.AuthService
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto dto);
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto);
        Task<bool> ForgotPasswordAsync(ForgotPasswordModel model);
        public Task ResetPasswordAsync(ResetPasswordModel model);
    }
}
