using MediatR;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.SubscriptionPlans.Commands.DeletePlan;

public class DeleteSubscriptionPlanHandler : IRequestHandler<DeleteSubscriptionPlanCommand>
{
    private readonly ISubscriptionPlanRepository _repository;

    public DeleteSubscriptionPlanHandler(ISubscriptionPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteSubscriptionPlanCommand request, CancellationToken ct)
    {
        await _repository.DeleteAsync(request.Id, ct);
    }
}