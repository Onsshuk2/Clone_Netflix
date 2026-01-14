using MediatR;
using Microsoft.AspNetCore.Identity;
using NetflixClone.Application.Interfaces;
using NetflixClone.Application.UseCases.Auth;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Application.UseCases.Auth.Commands.Login;

class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginCommandHandler(UserManager<User> userManager, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            throw new Exception("Invalid email ot password");
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
        {
            throw new Exception("Invalid email or password");
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

