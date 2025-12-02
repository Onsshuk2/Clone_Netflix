using System.Collections.Generic;
using System.Threading.Tasks;

public interface IUserRepository
{
    Task<IEnumerable<ApplicationUser>> GetAllAsync();
    Task<ApplicationUser?> GetByIdAsync(string id);
    Task<ApplicationUser?> GetByIdWithSubscriptionAsync(string id);
    Task<ApplicationUser?> GetByEmailAsync(string email);
    Task AddAsync(ApplicationUser user);
    Task<bool> UpdateAsync(ApplicationUser user);
    Task<bool> DeleteAsync(ApplicationUser user);
    Task SaveAsync();
}
