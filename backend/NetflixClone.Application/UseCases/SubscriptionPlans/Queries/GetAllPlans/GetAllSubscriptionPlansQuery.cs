using MediatR;

namespace NetflixClone.Application.UseCases.SubscriptionPlans.Queries.GetAllPlans;

public class GetAllSubscriptionPlansQuery : IRequest<List<SubscriptionPlanDto>>
{
    // Клас залишається порожнім, оскільки для отримання всіх записів параметри не потрібні
}