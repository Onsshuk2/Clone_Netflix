using AutoMapper;
// using Core.Models.AdminUser;
// using Domain.Entities.Identity;

namespace Core.Mapper;

public class AdminUserMapper : Profile
{
    public AdminUserMapper()
    {
        CreateMap<ApplicationUser, AdminUserItemModel>();
            // .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
            // .ForMember(dest => dest.IsLoginGoogle, opt => opt.MapFrom(src => src.UserLogins!.Any(l => l.LoginProvider == "Google")))
            // .ForMember(dest => dest.IsLoginPassword, opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.PasswordHash)))
            // .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles!.Select(ur => ur.Role.Name).ToList()))
            // .ForMember(dest => dest.LoginTypes, opt => opt.Ignore());
    }
}