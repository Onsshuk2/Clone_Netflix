using FluentValidation;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.SubscriptionPlans.Commands.DeletePlan;

public class DeleteSubscriptionPlanValidator : AbstractValidator<DeleteSubscriptionPlanCommand>
{
    public DeleteSubscriptionPlanValidator(ISubscriptionPlanRepository repository)
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID плану обов'язковий.")
            .MustAsync(async (id, ct) =>
            {
                var plan = await repository.GetByIdAsync(id, ct);
                return plan != null;
            })
            .WithMessage("План з таким ID не існує.");
    }
}