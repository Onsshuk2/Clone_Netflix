using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Constants;
using NetflixClone.Domain.Entities;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Users.Admin.Commands.CreateUser;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly UserManager<User> _userManager;
    private readonly IImageService _imageService;
    private readonly IMapper _mapper;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly ISubscriptionPlanRepository _planRepository; // Додаємо репозиторій планів

    public CreateUserHandler(
        UserManager<User> userManager,
        IImageService imageService,
        IMapper mapper,
        ISubscriptionRepository subscriptionRepository,
        ISubscriptionPlanRepository planRepository) // Впроваджуємо залежність
    {
        _userManager = userManager;
        _imageService = imageService;
        _mapper = mapper;
        _subscriptionRepository = subscriptionRepository;
        _planRepository = planRepository;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    { 
        // 1. Мапінг користувача (UserName генерується з Email у профілі мапінгу)
        var user = _mapper.Map<User>(request);

        // 2. Завантаження аватара
        if (request.Avatar != null)
        {
            user.AvatarUrl = await _imageService.UploadImageAsync(request.Avatar);
        }

        // 3. Створення користувача в системі Identity
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"User creation failed: {errors}");
        }

        // 4. Призначення ролей (за замовчуванням - User)
        var roles = (request.Roles != null && request.Roles.Any())
            ? request.Roles
            : new List<string> { RoleConstants.User };

        await _userManager.AddToRolesAsync(user, roles);

        // 5. ЛОГІКА ПІДПИСКИ
        Guid planIdToAssign;

        if (request.PlanId.HasValue)
        {
            planIdToAssign = request.PlanId.Value;
        }
        else
        {
            // Якщо план не вказано, шукаємо "Basic" у базі
            var allPlans = await _planRepository.GetAllAsync(cancellationToken);
            var basicPlan = allPlans.FirstOrDefault(p => p.Name == "Basic");

            if (basicPlan == null)
            {
                throw new Exception("Дефолтний план 'Basic' не знайдено. Перевірте SeedData.");
            }

            planIdToAssign = basicPlan.Id;
        }

        // Створюємо та зберігаємо підписку
        var subscription = _mapper.Map<UserSubscription>(request);
        subscription.UserId = user.Id;
        subscription.PlanId = planIdToAssign;

        // SaveChangesInterceptor автоматично проставить CreatedAt
        await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        return user.Id;
    }
}