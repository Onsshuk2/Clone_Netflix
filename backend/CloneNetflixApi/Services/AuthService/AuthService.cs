using CloneNetflixApi.Helpers.EmailHelpers;
using CloneNetflixApi.Models;
using CloneNetflixApi.Services.SmtpService;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CloneNetflixApi.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ISmtpService _smtpService;

        public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration, ISmtpService smtpService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _smtpService = smtpService;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto loginRequest)
        {
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (await _userManager.IsLockedOutAsync(user))
            {
                throw new UnauthorizedAccessException("User account is locked.");
            }

            return await GenerateTokenResponse(user);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto registerRequest)
        {
            var existingUser = await _userManager.FindByEmailAsync(registerRequest.Email);

            if (existingUser != null)
            {
                throw new ArgumentException("User with this email already exists.");
            }

            var user = new ApplicationUser
            {
                Email = registerRequest.Email,
                UserName = registerRequest.Email,
                DisplayName = registerRequest.DisplayName,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, registerRequest.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join("\n", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to register user: {errors}");
            }

            await _userManager.AddToRoleAsync(user, "User");

            return await GenerateTokenResponse(user);
        }

        private async Task<AuthResponseDto> GenerateTokenResponse(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim("displayName", user.DisplayName ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString()),
            };

            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var key = _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(key) || key.Length < 32)
                throw new InvalidOperationException("JWT key must be at least 32 characters long");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var expires = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:ExpirationInDays", 7));

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new AuthResponseDto
            {
                UserId = user.Id,
                Email = user.Email!,
                DisplayName = user.DisplayName ?? "",
                Roles = roles,
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                TokenExpires = expires
            };
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return false;
            }

            string token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink = $"{_configuration["ClientUrl"]}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(model.Email)}";

            var emailModel = new EmailMessage
            {
                To = model.Email,
                Subject = "Password Reset",
                Body = $"<p>Click the link below to reset your password:</p><a href='{resetLink}'>Reset Password</a>"
            };

            var result = await _smtpService.SendEmailAsync(emailModel);

            return result;
        }
    }
}
