using CloneNetflix.API;
using CloneNetflix.API.Middleware;
using NetflixClone.Application;
using NetflixClone.Application.Interfaces;
using NetflixClone.Infrastructure;
using NetflixClone.Infrastructure.Persistence;
using NetflixClone.Infrastructure.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// 1. Реєстрація сервісів (DI Container)
builder.Services.AddPresentation(); // Swagger, CORS, Controllers
builder.Services.AddApplication();   // MediatR, FluentValidation
builder.Services.AddInfrastructure(builder.Configuration); // DB, Identity, JWT

// ImageService
builder.Services.AddScoped<IImageService, ImageService>();

var app = builder.Build();

// 2. Сидинг бази даних (Ролі та Адмін)
using (var scope = app.Services.CreateScope())
{
    try
    {
        await DbInitializer.SeedData(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Помилка під час сидингу бази даних.");
    }
}

// 3. Конфігурація HTTP-конвеєра (Middleware)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 4. Налаштування статичних файлів для зображень
var dirImageName = builder.Configuration.GetValue<string>("DirImageName") ?? "duplo";
var path = Path.Combine(Directory.GetCurrentDirectory(), dirImageName);
Directory.CreateDirectory(path);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(path),
    RequestPath = $"/{dirImageName}"
});

app.UseHttpsRedirection();
app.UseCors("AllowAll"); // Політика має бути визначена в AddPresentation()

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();