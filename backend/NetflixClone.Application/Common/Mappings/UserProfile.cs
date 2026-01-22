using AutoMapper;
using NetflixClone.Application.UseCases.Users.Admin.Queries;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Application.Common.Mappings;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserAdminDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                    src.UserRoles.Select(ur => ur.Role.Name).ToList()));
    }
}