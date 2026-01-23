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

        if (admin != null)
            await EnsureSubscription(admin.Id, SubscriptionPlanConstants.Premium.Name, context);

        if (user != null)
            await EnsureSubscription(user.Id, SubscriptionPlanConstants.Standard.Name, context);
    }

    private static async Task<User?> SeedAdmin(UserManager<User> userManager)
    {
        var admin = await userManager.FindByEmailAsync(UserConstants.Admin.Email);

        if (admin == null)
        {
            admin = new User
            {
                UserName = UserConstants.Admin.UserName,
                Email = UserConstants.Admin.Email,
                DateOfBirth = new DateOnly(1990, 1, 1),
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, UserConstants.Admin.Password);
            if (!result.Succeeded)
            {

                return null;
            }

            await userManager.AddToRoleAsync(admin, RoleConstants.Admin);
        }
        return admin;
    }

    private static async Task<User?> SeedUser(UserManager<User> userManager)
    {
        var user = await userManager.FindByEmailAsync(UserConstants.TestUser.Email);

        if (user == null)
        {
            user = new User
            {
                UserName = UserConstants.TestUser.UserName,
                Email = UserConstants.TestUser.Email,
                DateOfBirth = new DateOnly(1990, 1, 1),
                EmailConfirmed = true,
                AvatarUrl = ""
            };

            var result = await userManager.CreateAsync(user, UserConstants.TestUser.Password);
            if (!result.Succeeded)
            {
                return null;
            }

            await userManager.AddToRoleAsync(user, RoleConstants.User);
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
                    EndDate = DateTime.UtcNow.AddDays(UserConstants.Technical.DefaultSubscriptionDays),
                    IsAutoRenew = true,
                    PaymentProviderTransactionId = UserConstants.Technical.MockTransactionId
                };

                await context.UserSubscriptions.AddAsync(subscription);
                await context.SaveChangesAsync();
            }
        }
    }
}