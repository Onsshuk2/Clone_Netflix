using Microsoft.Extensions.DependencyInjection;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var scopedServices = scope.ServiceProvider;

        await SubscriptionPlanSeeder.SeedAsync(scopedServices);
        await UserSeeder.SeedAsync(scopedServices);
        await SubscriptionSeeder.SeedAsync(scopedServices);

    }
}
