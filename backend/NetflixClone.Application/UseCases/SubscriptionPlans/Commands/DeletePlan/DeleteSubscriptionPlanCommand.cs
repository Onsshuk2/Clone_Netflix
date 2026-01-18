using MediatR;

namespace NetflixClone.Application.UseCases.SubscriptionPlans.Commands.DeletePlan;

public class DeleteSubscriptionPlanCommand : IRequest
{
    public int Id { get; set; }
}