using MediatR;
using Microsoft.AspNetCore.Identity;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Application.UseCases.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IImageService _imageService;

    public RegisterCommandHandler(UserManager<User> userManager, IJwtTokenGenerator jwtTokenGenerator, IImageService imageService)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _imageService = imageService;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (request.Password != request.ConfirmPassword)
            throw new Exception("Passwords do not match");

        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email,
            DateOfBirth = request.DateOfBirth,
            CreatedAt = DateTime.UtcNow
        };
        
        if (request.Image != null)
        {
            user.AvatarUrl = await _imageService.UploadImageAsync(request.Image);
        }

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Registration failed: {errors}");
        }

        await _userManager.AddToRoleAsync(user, "User");

        var roles = await _userManager.GetRolesAsync(user);

        var token = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthResponse
        {
            Id = user.Id,
            UserName = user.UserName!,
            Email = user.Email!,
            Token = token
        };
    }
}
