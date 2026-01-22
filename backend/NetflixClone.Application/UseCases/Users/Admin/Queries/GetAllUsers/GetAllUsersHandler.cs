using MediatR;
using Microsoft.AspNetCore.Identity;
using NetflixClone.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace NetflixClone.Application.UseCases.Users.Admin.Queries.GetAllUsers;

public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, List<UserAdminDto>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public GetAllUsersHandler(UserManager<User> userManager, IMapper mapper)
    {
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<List<UserAdminDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userManager.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<UserAdminDto>>(users);
    }
}
