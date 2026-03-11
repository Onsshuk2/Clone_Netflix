using AutoMapper;
using CloneNetflix.API.Models;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NetflixClone.Application.UseCases.Auth.Commands.ForgotPassword;
using NetflixClone.Application.UseCases.Auth.Commands.Login;
using NetflixClone.Application.UseCases.Auth.Commands.Register;
using NetflixClone.Application.UseCases.Auth.Commands.ResetPassword;
using NetflixClone.Domain.Entities;
using NetflixClone.Infrastructure.Services;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace CloneNetflix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<User> _userManager; 

    public AuthController(IMediator mediator, UserManager<User> userManager,
        IMapper mapper)
    {
        _mediator = mediator;
        _userManager = userManager;
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

        //configuration
        string userInfo = "https://www.googleapis.com/oauth2/v2/userinfo";
        var response = await httpClient.GetAsync(userInfo);

        if (!response.IsSuccessStatusCode)
            return BadRequest(new
            {
                Status = 400,
                IsValid = false,
                Errors = new { Email = "Помилка реєстрації" }
            });

        string json = await response.Content.ReadAsStringAsync();

        var googleUser = JsonConvert.DeserializeObject<GoogleAccountModel>(json);


        var existingUser = await _userManager.FindByEmailAsync(googleUser!.Email);
        if (existingUser != null)
        {
            var userLoginGoogle = await _userManager.FindByLoginAsync("Google", googleUser.GogoleId);

            if (userLoginGoogle == null)
            {
                await _userManager.AddLoginAsync(existingUser, new UserLoginInfo("Google", googleUser.GogoleId, "Google"));
            }
            //var jwtToken = await tokenService.CreateTokenAsync(existingUser);
            return Ok(new
            {
                Token = "Good"
            });
        }
        else
        {
            var user = new User
            {
                Email = googleUser.Email,
                UserName = googleUser.Email,
                
                
            };//_mapper.Map<User>(googleUser);

            if (!String.IsNullOrEmpty(googleUser.Picture))
            {
                //user.Image = await imageService.SaveImageFromUrlAsync(googleUser.Picture);
            }

            var result = await _userManager.CreateAsync(user);
            if (result.Succeeded)
            {

                result = await _userManager.AddLoginAsync(user, new UserLoginInfo(
                    loginProvider: "Google",
                    providerKey: googleUser.GogoleId,
                    displayName: "Google"
                ));

                await _userManager.AddToRoleAsync(user, "User");
                //var jwtToken = await tokenService.CreateTokenAsync(user);
                return Ok(new
                {
                    Token = "token"
                });
            }
        }
        return BadRequest(new
        {
            Status = 400,
            IsValid = false,
            Errors = new { Email = "Помилка реєстрації" }
        });
    }
}