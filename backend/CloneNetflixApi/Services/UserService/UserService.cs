using CloneNetflixApi.DTOs.User;
using CloneNetflixApi.Services.UserService;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(
        IUserRepository repository,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _repository = repository;
        _context = context;
        _userManager = userManager;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _repository.GetAllAsync();

        var result = new List<UserDto>();

        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);

            result.Add(new UserDto
            {
                Id = u.Id,
                DisplayName = u.DisplayName,
                Email = u.Email!,
                ProfilePictureUrl = u.ProfilePictureUrl,
                CreatedAt = u.CreatedAt,
                SubscriptionName = u.Subscription?.Plan?.Name,
                Roles = roles.ToList()
            });
        }

        return result;
    }

    public async Task<UserDto?> GetByIdAsync(string id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        var subscription = await _context.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.ApplicationUserId == user.Id);

        return new UserDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email!,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            SubscriptionName = subscription?.Plan?.Name,
            Roles = roles.ToList()
        };
    }

    public async Task<UserDto> AddUserAsync(CreateUserDto dto)
    {
        // Check unique email
        var existingUser = await _repository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException($"A user with email '{dto.Email}' already exists.");

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = dto.DisplayName,
            ProfilePictureUrl = dto.ProfilePictureUrl,
            SubscriptionId = dto.SubscriptionId,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(user);

        var passwordResult = await _userManager.AddPasswordAsync(user, dto.Password);
        if (!passwordResult.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", passwordResult.Errors.Select(e => e.Description)));
        }

        await _repository.SaveAsync();

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            SubscriptionName = null,
            Roles = new List<string>()
        };
    }

    public async Task<bool> UpdateUserAsync(string id, UpdateUserDto dto)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException("User not found.");

        user.DisplayName = dto.DisplayName ?? user.DisplayName;
        user.ProfilePictureUrl = dto.ProfilePictureUrl ?? user.ProfilePictureUrl;

        await _repository.UpdateAsync(user);
        await _repository.SaveAsync();
        return true;
    }
    public async Task<bool> ChangePasswordAsync(string id, ChangePasswordDto dto)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException("User not found.");

        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new InvalidOperationException("New password and confirmation do not match.");

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        return true;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException("User not found.");

        await _repository.DeleteAsync(user);
        await _repository.SaveAsync();
        return true;
    }
}
