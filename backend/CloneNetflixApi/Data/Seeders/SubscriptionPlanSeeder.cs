using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class SubscriptionPlanSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!await context.SubscriptionPlans.AnyAsync())
        {
            var plans = new List<SubscriptionPlan>
            {
                new SubscriptionPlan
                {
                    Name = "Free",
                    Description = "Безкоштовний тариф з базовим доступом.",
                    Price = 0.00m,
                    Quality = VideoQuality.SD,
                    MaxDevices = 1,
                    IsAvailable = true
                },
                new SubscriptionPlan
                {
                    Name = "Standard",
                    Description = "HD якість, до 2 пристроїв.",
                    Price = 9.99m,
                    Quality = VideoQuality.HD,
                    MaxDevices = 2,
                    IsAvailable = true
                },
                new SubscriptionPlan
                {
                    Name = "Premium",
                    Description = "4K якість, до 4 пристроїв.",
                    Price = 14.99m,
                    Quality = VideoQuality.UltraHD,
                    MaxDevices = 4,
                    IsAvailable = true
                }
            };

            await context.SubscriptionPlans.AddRangeAsync(plans);
            await context.SaveChangesAsync();
        }
    }
}
