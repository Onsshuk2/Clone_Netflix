using CloneNetflixApi.Services.UserService;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; 

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public UserService(IUserRepository repository, UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _repository = repository;
        _userManager = userManager;
        _context = context;
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
        var user = await _userManager.FindByIdAsync(id);

        if (user == null)
        {
            // Якщо _userManager його не знайшов, то користувача дійсно не існує.
            return null;
        }

        var subscription = await _context.Subscriptions
            .Include(s => s.Plan) // Завантажуємо План
            .FirstOrDefaultAsync(s => s.ApplicationUserId == user.Id); // Знаходимо за ID користувача

        return new UserDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email!,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CreatedAt = user.CreatedAt,
            // Використовуємо підписку, яку ми щойно безпечно завантажили
            SubscriptionName = subscription?.Plan?.Name
        };
    }

    public async Task<bool> UpdateUserAsync(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        user.DisplayName = dto.DisplayName ?? user.DisplayName;

        user.ProfilePictureUrl = dto.ProfilePictureUrl ?? user.ProfilePictureUrl;

        await _repository.UpdateAsync(user); // Ми все ще використовуємо репозиторій для Update/Save
        await _repository.SaveAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(string id, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        if (dto.NewPassword != dto.ConfirmNewPassword)
        {
            return false;
        }

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        return result.Succeeded;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded;

    }
}
