using CloneNetflix.API.Middleware;
using CloneNetflix.API;
using NetflixClone.Application;
using NetflixClone.Infrastructure;
using NetflixClone.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddPresentation();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

await DbInitializer.SeedData(app.Services);

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseImagesStaticFiles(builder.Configuration);

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();