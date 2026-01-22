using Microsoft.EntityFrameworkCore;
using NetflixClone.Domain.Entities;
using NetflixClone.Domain.Constants;

namespace NetflixClone.Infrastructure.Persistence.Seeders;

public static class PlanSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.SubscriptionPlans.AnyAsync()) return;

        var plans = new List<SubscriptionPlan>
        {
            new()
            {
                Name = SubscriptionPlanConstants.Basic.Name,
                Price = SubscriptionPlanConstants.Basic.Price,
                Quality = SubscriptionPlanConstants.Basic.Quality,
                MaxDevices = SubscriptionPlanConstants.Basic.MaxDevices
            },
            new()
            {
                Name = SubscriptionPlanConstants.Standard.Name,
                Price = SubscriptionPlanConstants.Standard.Price,
                Quality = SubscriptionPlanConstants.Standard.Quality,
                MaxDevices = SubscriptionPlanConstants.Standard.MaxDevices
            },
            new()
            {
                Name = SubscriptionPlanConstants.Premium.Name,
                Price = SubscriptionPlanConstants.Premium.Price,
                Quality = SubscriptionPlanConstants.Premium.Quality,
                MaxDevices = SubscriptionPlanConstants.Premium.MaxDevices
            }
        };

        await context.SubscriptionPlans.AddRangeAsync(plans);
        await context.SaveChangesAsync();
    }
}