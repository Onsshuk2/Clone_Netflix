using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NetflixClone.Application.Common.Behaviors;

namespace NetflixClone.Application;

// Просто конфігурація, щоб не засоряти Program.cs пишемо тут
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(configuration => {
            configuration.RegisterServicesFromAssembly(assembly);
            configuration.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}