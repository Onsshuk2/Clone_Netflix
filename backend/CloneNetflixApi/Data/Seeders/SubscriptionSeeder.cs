using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class SubscriptionSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var freePlan = await context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Name == "Free");
        var users = await context.Users.Include(u => u.Subscription).ToListAsync();

        if (freePlan == null)
        {
            Console.WriteLine("❌ Free plan not found. Please seed SubscriptionPlanSeeder first.");
            return;
        }

        foreach (var user in users)
        {
            if (user.Subscription != null)
                continue;

            var subscription = new Subscription
            {
                ApplicationUserId = user.Id,
                SubscriptionPlanId = freePlan.Id,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(10),
                IsActive = true
            };

            await context.Subscriptions.AddAsync(subscription);
        }

        await context.SaveChangesAsync();
        Console.WriteLine("✅ Subscriptions seeded successfully.");
    }
}
