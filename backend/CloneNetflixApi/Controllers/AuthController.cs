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
<<<<<<< HEAD
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;
=======
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3

namespace CloneNetflix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
<<<<<<< HEAD
    private readonly ILogger<AuthController> _logger;
=======
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3

    public AuthController(
        IMediator mediator,
        UserManager<User> userManager,
        IMapper mapper,
<<<<<<< HEAD
        IJwtTokenGenerator jwtTokenGenerator,
        ILogger<AuthController> logger)
    
=======
        IJwtTokenGenerator jwtTokenGenerator)
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
    {
        _mediator = mediator;
        _userManager = userManager;
        _jwtTokenGenerator = jwtTokenGenerator;
<<<<<<< HEAD
        _logger = logger;
=======
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
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
<<<<<<< HEAD
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
=======
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

>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
            await _userManager.AddToRoleAsync(user, "User");

            var roles = await _userManager.GetRolesAsync(user);
            var jwt = _jwtTokenGenerator.GenerateToken(user, roles);

<<<<<<< HEAD
            return Ok(new { token = jwt });
        }
        catch (InvalidJwtException ex)
        {
            return BadRequest(new { message = $"Невалідний токен: {ex.Message}" });
        }
        catch
        {
            return StatusCode(500, new { message = "Помилка сервера" });
=======
            return Ok(new
            {
                Token = jwt
            });
>>>>>>> b629eb947d56b1837a8fae1f71e47b3ebc8be3a3
        }
    }
}