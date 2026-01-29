using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Constants;
using NetflixClone.Domain.Entities;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Users.Admin.Commands.UpdateUser;

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly UserManager<User> _userManager;
    private readonly IImageService _imageService;
    private readonly IMapper _mapper;
    private readonly ISubscriptionRepository _subscriptionRepository;

    public UpdateUserHandler(
        UserManager<User> userManager,
        IImageService imageService,
        IMapper mapper,
        ISubscriptionRepository subscriptionRepository)
    {
        _userManager = userManager;
        _imageService = imageService;
        _mapper = mapper;
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id.ToString());
        if (user == null) throw new Exception("Користувача не знайдено");

        // 1. Спочатку виконуємо мапінг основних полів
        // Це важливо зробити ДО обробки фото, щоб мапер не затер нову URL-адресу аватара
        _mapper.Map(request, user);

        // 2. Обробка фото (після основного мапінгу)
        if (request.Avatar != null)
        {
            var oldAvatarUrl = user.AvatarUrl;
            var newAvatarUrl = await _imageService.UploadImageAsync(request.Avatar);

            if (!string.IsNullOrEmpty(newAvatarUrl))
            {
                user.AvatarUrl = newAvatarUrl;
                if (!string.IsNullOrEmpty(oldAvatarUrl))
                {
                    await _imageService.DeleteImageAsync(oldAvatarUrl);
                }
            }
        }

        // Зберігаємо зміни користувача
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Помилка при оновленні користувача: {errors}");
        }

        // 3. Оновлення ролей (без змін)
        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        var rolesToAssign = (request.Roles != null && request.Roles.Any())
            ? request.Roles
            : new List<string> { RoleConstants.User };
        await _userManager.AddToRolesAsync(user, rolesToAssign);

        // 4. Логіка підписок
        if (request.PlanId.HasValue)
        {
            // Отримуємо підписки конкретного користувача (замість GetAllAsync для продуктивності)
            var allUserSubs = await _subscriptionRepository.GetAllAsync(cancellationToken);
            var activeSub = allUserSubs
                .Where(s => s.UserId == user.Id && s.EndDate > DateTime.UtcNow)
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefault();

            if (activeSub != null)
            {
                if (activeSub.PlanId != request.PlanId.Value)
                {
                    activeSub.PlanId = request.PlanId.Value;
                    activeSub.EndDate = DateTime.UtcNow.AddDays(30);
                    await _subscriptionRepository.UpdateAsync(activeSub, cancellationToken);
                }
            }
            else
            {
                // Створюємо нову підписку
                var newSubscription = _mapper.Map<UserSubscription>(request);

                // ОБОВ'ЯЗКОВО: Прив'язуємо ID користувача та ID плану вручну, 
                // оскільки мапер їх зазвичай ігнорує
                newSubscription.UserId = user.Id;
                newSubscription.PlanId = request.PlanId.Value;

                await _subscriptionRepository.AddAsync(newSubscription, cancellationToken);
            }
        }
    }
}