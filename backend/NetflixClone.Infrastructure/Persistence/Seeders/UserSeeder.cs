using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NetflixClone.Domain.Constants;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Infrastructure.Persistence.Seeders;

public static class UserSeeder
{
    public static async Task SeedAsync(UserManager<User> userManager, ApplicationDbContext context)
    {
        var admin = await SeedAdmin(userManager);
        var user = await SeedUser(userManager);

        if (admin != null) await EnsureSubscription(admin.Id, "Premium", context);
        if (user != null) await EnsureSubscription(user.Id, "Standard", context);
    }

    private static async Task<User?> SeedAdmin(UserManager<User> userManager)
    {
        var adminEmail = "admin@gmail.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);

        if (admin == null)
        {
            admin = new User
            {
                UserName = "admin",
                Email = adminEmail,
                DateOfBirth = new DateOnly(1990, 1, 1),
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "Admin123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, Roles.Admin);
            }
        }
        return admin;
    }

    private static async Task<User?> SeedUser(UserManager<User> userManager)
    {
        var userEmail = "user@gmail.com";
        var user = await userManager.FindByEmailAsync(userEmail);

        if (user == null)
        {
            user = new User
            {
                UserName = "user",
                Email = userEmail,
                DateOfBirth = new DateOnly(1990, 1, 1),
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, "User123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, Roles.User);
            }
        }
        return user;
    }

    private static async Task EnsureSubscription(Guid userId, string planName, ApplicationDbContext context)
    {
        var hasSubscription = await context.UserSubscriptions.AnyAsync(s => s.UserId == userId);

        if (!hasSubscription)
        {
            var plan = await context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Name == planName);

            if (plan != null)
            {
                var subscription = new UserSubscription
                {
                    UserId = userId,
                    PlanId = plan.Id,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(30),
                    IsAutoRenew = true,
                    PaymentProviderTransactionId = "SEED_MOCK_TRANSACTION" // Емуляція ID транзакції
                };

                await context.UserSubscriptions.AddAsync(subscription);
                await context.SaveChangesAsync();
            }
        }
    }
}