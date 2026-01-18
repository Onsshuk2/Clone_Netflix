using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NetflixClone.Application.UseCases.SubscriptionPlans.Commands.CreatePlan;
using NetflixClone.Application.UseCases.SubscriptionPlans.Commands.DeletePlan;
using NetflixClone.Application.UseCases.SubscriptionPlans.Commands.UpdatePlan;
using NetflixClone.Application.UseCases.SubscriptionPlans.Queries.GetAllPlans;
using NetflixClone.Application.UseCases.SubscriptionPlans.Queries.GetPlanById;

[ApiController]
[Route("api/plans")]
public class PlansController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlansController(IMediator mediator) => _mediator = mediator;

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllSubscriptionPlansQuery()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
        => Ok(await _mediator.Send(new GetSubscriptionPlanByIdQuery { Id = id }));

    [HttpPost("create")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSubscriptionPlanCommand command)
        => Ok(await _mediator.Send(command));

    [HttpPut("update/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSubscriptionPlanCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _mediator.Send(new DeleteSubscriptionPlanCommand { Id = id });
        return NoContent();
    }
}