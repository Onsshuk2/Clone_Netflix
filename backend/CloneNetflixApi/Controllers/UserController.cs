using CloneNetflixApi.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CloneNetflixApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize] // All routes require authentication
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // ✅ 1. Get all users — TEMPORARILY public for testing
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        // ✅ 2. Get user by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMyProfile()
        {
            var allClaims = User.Claims.Select(c => new
            {
                Type = c.Type,  
                Value = c.Value  
            }).ToList();

            var userId = User.FindFirstValue("userId");

            if (userId == null)
            {
                return Unauthorized(new
                {
                    message = "Unauthorized. Token does not contain a NameIdentifier claim (ClaimTypes.NameIdentifier).",
                    claimsInToken = allClaims
                });
            }

            var userFromDb = await _userService.GetByIdAsync(userId);

            if (userFromDb == null)
            {
                return NotFound(new
                {
                    message = "User not found. The ID from the token was valid, but no user with this ID exists in the database.",
                    userIdFromToken = userId,
                    claimsInToken = allClaims
                });
            }

            var response = new
            {
                tokenData = allClaims,
                databaseData = userFromDb 
            };

            return Ok(response);
        }

        // ✅ 4. Update current user's profile
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userService.UpdateUserAsync(userId, dto);
            if (!result)
                return NotFound(new { message = "User not found or update failed" });

            return Ok(new { message = "Profile updated successfully" });
        }

        // ✅ 5. Change password
        [HttpPut("me/password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userService.ChangePasswordAsync(userId, dto);
            if (!result)
                return BadRequest(new { message = "Password change failed. Check your current password." });

            return Ok(new { message = "Password changed successfully" });
        }

        // ✅ 6. Delete current user's account
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteMyAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _userService.DeleteUserAsync(userId);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User deleted successfully" });
        }

        // ✅ 7. Delete any user by ID (for testing only)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return NotFound(new { message = "User not found" });

            return Ok(new { message = "User deleted successfully" });
        }
    }
}
