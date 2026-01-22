using MediatR;
using Microsoft.AspNetCore.Mvc;
using NetflixClone.Application.UseCases.Users.Admin.Queries;
using NetflixClone.Application.UseCases.Users.Admin.Queries.GetAllUsers;

namespace NetflixClone.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
// [Authorize(Roles = "Admin")] // Розкоментуйте пізніше, коли налаштуєте ролі
public class AdminUsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminUsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserAdminDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetAllUsersQuery());
        return Ok(result);
    }
}