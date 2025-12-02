using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class UserSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await context.Database.MigrateAsync();

        // Ролі
        string[] roles = { "Admin", "User", "Moderator" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Адмін
        var adminEmail = "admin@netflix.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            var user = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                DisplayName = "Admin",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            if ((await userManager.CreateAsync(user, "Admin123!")).Succeeded)
                await userManager.AddToRoleAsync(user, "Admin");
        }

        // Звичайний користувач
        var userEmail = "user@netflix.com";
        var existingUser = await userManager.FindByEmailAsync(userEmail);
        if (existingUser == null)
        {
            var user = new ApplicationUser
            {
                UserName = userEmail,
                Email = userEmail,
                DisplayName = "Demo User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            if ((await userManager.CreateAsync(user, "User123!")).Succeeded)
                await userManager.AddToRoleAsync(user, "User");
        }
    }
}
