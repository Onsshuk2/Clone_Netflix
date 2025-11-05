using Microsoft.EntityFrameworkCore;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ApplicationUser>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.Subscription)
            .ThenInclude(s => s.Plan)
            .ToListAsync();
    }

    public async Task<ApplicationUser?> GetByIdAsync(string id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

    }

    public async Task<ApplicationUser?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task AddAsync(ApplicationUser user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task UpdateAsync(ApplicationUser user)
    {
        _context.Users.Update(user);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(ApplicationUser user)
    {
        _context.Users.Remove(user);
        await Task.CompletedTask;
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}
