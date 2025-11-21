namespace CloneNetflixApi.Services.UserService
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto?> GetByIdAsync(string id);
        Task<bool> UpdateUserAsync(string id, UpdateUserDto dto);
        Task<bool> ChangePasswordAsync(string id, ChangePasswordDto dto);
        Task<bool> DeleteUserAsync(string id);
        Task<SearchResult<AdminUserItemModel>> SearchUsersAsync(UserSearchModel model);
    }

}
