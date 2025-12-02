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
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<ApplicationUser?> GetByIdAsync(string id)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<ApplicationUser?> GetByIdWithSubscriptionAsync(string id)
    {
        return await _context.Users
            .Include(u => u.Subscription)
            .ThenInclude(s => s.Plan)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<ApplicationUser?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task AddAsync(ApplicationUser user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task<bool> UpdateAsync(ApplicationUser user)
    {
        var exists = await _context.Users.AnyAsync(u => u.Id == user.Id);
        if (!exists) return false;

        _context.Users.Update(user);
        return true;
    }

    public async Task<bool> DeleteAsync(ApplicationUser user)
    {
        var exists = await _context.Users.AnyAsync(u => u.Id == user.Id);
        if (!exists) return false;

        _context.Users.Remove(user);
        return true;
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}
