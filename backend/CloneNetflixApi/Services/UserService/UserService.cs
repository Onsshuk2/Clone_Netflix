using CloneNetflixApi.DTOs.User;
using CloneNetflixApi.Services.UserService;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<ApplicationUser> _passwordHasher;

public UserService(IUserRepository repository, ApplicationDbContext context)
    {
        _repository = repository;
        _context = context;
        _passwordHasher = new PasswordHasher<ApplicationUser>();
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _repository.GetAllAsync();

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            DisplayName = u.DisplayName,
            Email = u.Email!,
            ProfilePictureUrl = u.ProfilePictureUrl,
            CreatedAt = u.CreatedAt,
            SubscriptionName = u.Subscription?.Plan?.Name
        });
    }

    public async Task<UserDto?> GetByIdAsync(string id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null) return null;

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
            SubscriptionName = subscription?.Plan?.Name
        };
    }

    public async Task<UserDto> AddUserAsync(CreateUserDto dto)
    {
        // Check for unique email
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
        await _repository.SaveAsync();

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            SubscriptionName = null
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

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);
        if (verificationResult == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Current password is incorrect.");

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.NewPassword);

        await _repository.UpdateAsync(user);
        await _repository.SaveAsync();

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
