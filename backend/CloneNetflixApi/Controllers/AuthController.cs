using CloneNetflixApi.Helpers;
using CloneNetflixApi.Interfaces;
using CloneNetflixApi.Models;
using CloneNetflixApi.Services.AuthService;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    private readonly ISmtpService _smtpService;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, ISmtpService smtpService)
    {
        _authService = authService;
        _logger = logger;
        _smtpService = smtpService;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var authResponse = await _authService.RegisterAsync(registerRequest);
            return Ok(authResponse);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Registration failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex) 
        {
            _logger.LogError(ex, "Registration failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred during registration.");
            return StatusCode(500, new { message = "An internal server error occurred." });
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var authResponse = await _authService.LoginAsync(loginRequest);
            await _smtpService.SendEmailAsync(new EmailMessage
            {
                To = loginRequest.Email,
                Subject = "Login Notification",
                Body = "<h1>Login Alert</h1><p>You have successfully logged in to your account.</p>"
            });
            return Ok(authResponse);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Login failed: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred during login.");
            return StatusCode(500, new { message = "An internal server error occurred." });
        }



    }
    
    [HttpPost]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            bool res = await _authService.ForgotPasswordAsync(model);
            if (res)
                return Ok();
            else
                return BadRequest(new
                {
                    Status = 400,
                    IsValid = false,
                    Errors = new { Email = "Користувача з такою поштою не існує" }
                });
        }
}