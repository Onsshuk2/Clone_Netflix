using AutoMapper;
using AutoMapper.QueryableExtensions;
using CloneNetflixApi.Services.UserService;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; 

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UserService(IUserRepository repository, UserManager<ApplicationUser> userManager, ApplicationDbContext context, IMapper mapper)
    {
        _repository = repository;
        _userManager = userManager;
        _context = context;
        _mapper = mapper;
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

    public async Task<SearchResult<AdminUserItemModel>> SearchUsersAsync(UserSearchModel model)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(model.Name))
        {
            string nameFilter = model.Name.Trim().ToLower().Normalize();

            query = query.Where(u =>
                u.DisplayName!.ToLower().Contains(nameFilter));
        }

        if (model?.StartDate != null)
        {
            query = query.Where(u => u.CreatedAt >= model.StartDate);
        }

        if (model?.EndDate != null)
        {
            query = query.Where(u => u.CreatedAt <= model.EndDate);
        }

        // if (model.Roles != null && model.Roles.Any())
        // {
        //     var roles = model.Roles.Where(x=>!string.IsNullOrEmpty(x));
        //     if(roles.Count() > 0)
        //         query = query.Where(user => roles.Any(role => user.UserRoles.Select(x=>x.Role.Name).Contains(role)));
        // }

        var totalCount = await query.CountAsync();

        var safeItemsPerPage = model.ItemPerPAge < 1 ? 10 : model.ItemPerPAge;
        var totalPages = (int)Math.Ceiling(totalCount / (double)safeItemsPerPage);
        var safePage = Math.Min(Math.Max(1, model.Page), Math.Max(1, totalPages));

        var users = await query
            .OrderBy(u => u.Id)
            .Skip((safePage - 1) * safeItemsPerPage)
            .Take(safeItemsPerPage)
            .ProjectTo<AdminUserItemModel>(_mapper.ConfigurationProvider)
            .ToListAsync();

       //await LoadLoginsAndRolesAsync(users);

        return new SearchResult<AdminUserItemModel>
        {
            Items = users,
            Pagination = new PaginationModel
            {
                TotalCount = totalCount,
                TotalPages = totalPages,
                ItemsPerPage = safeItemsPerPage,
                CurrentPage = safePage
            }
        };
    }
}
