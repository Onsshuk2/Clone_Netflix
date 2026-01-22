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

    public CreateUserHandler(
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

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    { 
        var user = _mapper.Map<User>(request);

        if (request.Image != null)
        {
            user.AvatarUrl = await _imageService.UploadImageAsync(request.Image);
        }

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"User creation failed: {errors}");
        }

        var roles = (request.Roles != null && request.Roles.Any())
            ? request.Roles
            : new List<string> { RoleConstants.User };

        await _userManager.AddToRolesAsync(user, roles);

        if (request.PlanId.HasValue)
        {
            var subscription = _mapper.Map<UserSubscription>(request);

            subscription.UserId = user.Id;

            await _subscriptionRepository.AddAsync(subscription, cancellationToken);
        }

        return user.Id;
    }
}