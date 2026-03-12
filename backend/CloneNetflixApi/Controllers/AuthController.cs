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

namespace CloneNetflix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthController(
        IMediator mediator,
        UserManager<User> userManager,
        IMapper mapper,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _mediator = mediator;
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
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
        string token = model.Token;

        using var httpClient = new HttpClient();

        httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        string userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        var response = await httpClient.GetAsync(userInfoUrl);

        if (!response.IsSuccessStatusCode)
        {
            return BadRequest(new
            {
                Status = 400,
                IsValid = false,
                Errors = new { Email = "Помилка реєстрації" }
            });
        }

        string json = await response.Content.ReadAsStringAsync();

        var googleUser = JsonConvert.DeserializeObject<GoogleAccountModel>(json);

        if (googleUser == null)
            return BadRequest();

        var existingUser = await _userManager.FindByEmailAsync(googleUser.Email);

        if (existingUser != null)
        {
            var userLoginGoogle =
                await _userManager.FindByLoginAsync("Google", googleUser.GogoleId);

            if (userLoginGoogle == null)
            {
                await _userManager.AddLoginAsync(existingUser,
                    new UserLoginInfo("Google", googleUser.GogoleId, "Google"));
            }

            var roles = await _userManager.GetRolesAsync(existingUser);
            var jwt = _jwtTokenGenerator.GenerateToken(existingUser, roles);

            return Ok(new
            {
                Token = jwt
            });
        }
        else
        {
            var user = new User
            {
                Email = googleUser.Email,
                UserName = googleUser.Email
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddLoginAsync(user,
                new UserLoginInfo(
                    loginProvider: "Google",
                    providerKey: googleUser.GogoleId,
                    displayName: "Google"));

            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);
            var jwt = _jwtTokenGenerator.GenerateToken(user, roles);

            return Ok(new
            {
                Token = jwt
            });
        }
    }
}