namespace NetflixClone.Application.UseCases.Auth;

//Просто модель яку ми повертаємо в контролер
public record AuthResponse(
    Guid Id,
    string UserName,
    string Email,
    string Token
);