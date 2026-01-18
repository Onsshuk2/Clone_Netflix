using Microsoft.EntityFrameworkCore;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Infrastructure.Persistence.Seeders;

public static class PlanSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.SubscriptionPlans.AnyAsync()) return;

        var plans = new List<SubscriptionPlan>
        {
            new() { Name = "Basic", Price = 149.99m, Quality = "SD", MaxDevices = 1 },
            new() { Name = "Standard", Price = 249.99m, Quality = "HD", MaxDevices = 2 },
            new() { Name = "Premium", Price = 349.99m, Quality = "4K", MaxDevices = 4 }
        };

        await context.SubscriptionPlans.AddRangeAsync(plans);
        await context.SaveChangesAsync();
    }
}