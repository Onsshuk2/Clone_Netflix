using CloneNetflix.API;
using CloneNetflix.API.Middleware;
using NetflixClone.Application;
using NetflixClone.Infrastructure;
using NetflixClone.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1. Підключення шарів архітектури
builder.Services.AddPresentation(); // Налаштування Swagger, CORS, Controllers
builder.Services.AddApplication();   // MediatR, FluentValidation
builder.Services.AddInfrastructure(builder.Configuration); // DB, Identity, JWT

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

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();