using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using CloneNetflixApi.Services.UserService;
using CloneNetflixApi.Services.AuthService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using CloneNetflixApi.Interfaces;
using CloneNetflixApi.Services; // 👈 ДОДАНО: Для налаштувань Swagger

var builder = WebApplication.CreateBuilder(args);

// --- КОНФІГУРАЦІЯ СЕРВІСІВ ---

// 1. Зчитування рядка підключення
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found in configuration.");
}

// 2. Реєстрація DbContext (PostgreSQL)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 3. Реєстрація ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();


// 4. Налаштування JWT-Аутентифікації
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role
    };
});



// 5. Контролери та Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 👈 ОНОВЛЕНО: Налаштування Swagger Gen для підтримки JWT "Authorize"
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Netflix Clone API", Version = "v1" });

    // Це додає визначення безпеки для JWT
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Будь ласка, введіть 'Bearer', пробіл, а потім ваш токен.\n\n" +
                      "Приклад: 'Bearer eyJhbGciOiJIUzI1Ni...'",
        Name = "Authorization",
        Type = SecuritySchemeType.Http, // Використовуємо Http
        BearerFormat = "JWT",
        Scheme = "bearer" // "bearer" в нижньому регістрі
    });

    // Це робить кнопку 'Authorize' глобальною для всіх ендпоінтів
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
            new string[] {}
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});



// 6. Реєстрація ваших сервісів
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISmtpService, SmtpService>();

var app = builder.Build();

// --- КОНВЕЙЄР ЗАПИТІВ ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Netflix Clone API V1");
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// ВАЖЛИВО: Ці два рядки мають бути в цьому порядку
app.UseAuthentication(); // 1. Хто ви? (Перевіряє JWT токен)
app.UseAuthorization();  // 2. Що вам дозволено? (Перевіряє ролі [Authorize(Roles="Admin")])

app.MapControllers();


// ✅ ВИКЛИК СІДЕРА — САМЕ ТУТ
await DataSeeder.SeedAsync(app.Services);


// 🚀 Запуск додатку
app.Run();