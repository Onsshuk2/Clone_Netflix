using MediatR;
using Microsoft.AspNetCore.Identity;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Application.UseCases.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RegisterCommandHandler(UserManager<User> userManager, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (request.Password != request.ConfirmPassword)
            throw new Exception("Password do not match");

        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email,
            DateOfBirth = request.DateOfBirth,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Registration failed: {errors}");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponse(
            user.Id,
            user.UserName!,
            user.Email!,
            token
        );
    }
}
