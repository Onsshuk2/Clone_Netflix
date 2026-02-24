using MediatR;
using Microsoft.AspNetCore.Mvc;
using NetflixClone.Application.UseCases.Auth.Commands.ForgotPassword;
using NetflixClone.Application.UseCases.Auth.Commands.Login;
using NetflixClone.Application.UseCases.Auth.Commands.Register;
using NetflixClone.Application.UseCases.Auth.Commands.ResetPassword;

namespace CloneNetflix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterCommand command)
    {
        var response = await _mediator.Send(command);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var response = await _mediator.Send(command);
        return Ok(response);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        bool result = await _mediator.Send(command);

        if (result)
            return Ok();

        return BadRequest(new
        {
            Status = 400,
            IsValid = false,
            Errors = new { Email = "Користувача з такою поштою не існує" }
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        bool result = await _mediator.Send(command);

        if (result)
            return Ok();

        return BadRequest(new
        {
            Status = 400,
            IsValid = false,
            Errors = new { Message = "Не вдалося змінити пароль. Перевірте токен або спробуйте ще раз." }
        });
    }
}