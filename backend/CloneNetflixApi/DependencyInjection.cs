using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;

namespace CloneNetflix.API;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Вставте ТІЛЬКИ токен (без слова Bearer і без лапок)"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }

    public static IApplicationBuilder UseImagesStaticFiles(this IApplicationBuilder app, IConfiguration configuration)
    {
        var dirImageName = configuration.GetValue<string>("DirImageName") ?? "duplo";
        var path = Path.Combine(Directory.GetCurrentDirectory(), dirImageName);

        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(path),
            RequestPath = $"/{dirImageName}"
        });

        return app;
    }
}