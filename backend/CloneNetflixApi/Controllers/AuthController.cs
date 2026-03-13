using AutoMapper;
using CloneNetflix.API.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NetflixClone.Application.Interfaces;
using NetflixClone.Application.UseCases.Auth.Commands.ForgotPassword;
using NetflixClone.Application.UseCases.Auth.Commands.Login;
using NetflixClone.Application.UseCases.Auth.Commands.Register;
using NetflixClone.Application.UseCases.Auth.Commands.ResetPassword;
using NetflixClone.Domain.Entities;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace CloneNetflix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IMediator mediator,
        UserManager<User> userManager,
        IMapper mapper,
        IJwtTokenGenerator jwtTokenGenerator,
        ILogger<AuthController> logger)
    
    {
        _mediator = mediator;
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
        _logger = logger;
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

    [HttpPost("GoogleLogin")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestModel model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Token))
        {
            return BadRequest(new { message = "Токен відсутній або невалідний" });
        }

        try
        {
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { "173960592807-uq3f6o1577k4207iqj4861uccskmtjl3.apps.googleusercontent.com" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(model.Token, validationSettings);

            if (!payload.EmailVerified)
            {
                return BadRequest(new { message = "Email не підтверджено в Google" });
            }

            string googleId = payload.Subject;
            string email = payload.Email;

            var user = await _userManager.FindByEmailAsync(email);

            if (user != null)
            {
                // Додаємо прив'язку, якщо її ще немає
                var loginInfo = await _userManager.FindByLoginAsync("Google", googleId);
                if (loginInfo == null)
                {
                    await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", googleId, "Google"));
                }

                var roles = await _userManager.GetRolesAsync(user);
                var jwt = _jwtTokenGenerator.GenerateToken(user, roles);

                return Ok(new { token = jwt });
            }

            // Новий користувач
            user = new User
            {
                Email = email,
                UserName = email,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user);

            if (!createResult.Succeeded)
            {
                return BadRequest(createResult.Errors);
            }

            await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", googleId, "Google"));
            await _userManager.AddToRoleAsync(user, "User");

            var rolesNew = await _userManager.GetRolesAsync(user);
            var jwtNew = _jwtTokenGenerator.GenerateToken(user, rolesNew);

            return Ok(new { token = jwtNew });
        }
        catch (InvalidJwtException ex)
        {
            return BadRequest(new { message = $"Невалідний або прострочений токен: {ex.Message}" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Внутрішня помилка сервера" });
        }
    }
    [HttpPost("GoogleRegister")]
    public async Task<IActionResult> GoogleRegister([FromBody] GoogleLoginRequestModel model)
    {
        if (model?.Token is not { Length: > 0 })
            return BadRequest(new { message = "Токен відсутній" });


        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { "839022778863-4dira2q9f6uoaab3kpgmhqe5tm1f5ehh.apps.googleusercontent.com" }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(model.Token, settings);

            if (!payload.EmailVerified)
                return BadRequest(new { message = "Email не підтверджено в Google" });

            string googleId = payload.Subject;
            string email = payload.Email;

            if (await _userManager.FindByEmailAsync(email) != null)
                return BadRequest(new { message = "Користувач з таким email уже існує. Увійдіть." });

            var user = new User
            {
                Email = email,
                UserName = email,
                EmailConfirmed = true,
                DateOfBirth = new DateOnly(2000, 1, 1)
            };

            var createResult = await _userManager.CreateAsync(user);

            if (!createResult.Succeeded)
                return BadRequest(createResult.Errors);

            await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", googleId, "Google"));
            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);
            var jwt = _jwtTokenGenerator.GenerateToken(user, roles);

            return Ok(new { token = jwt });
        }
        catch (InvalidJwtException ex)
        {
            return BadRequest(new { message = $"Невалідний токен: {ex.Message}" });
        }
        catch
        {
            return StatusCode(500, new { message = "Помилка сервера" });
        }
    }
}