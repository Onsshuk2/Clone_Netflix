using Microsoft.AspNetCore.Http;

namespace NetflixClone.Application.Interfaces;

public interface IImageService
{
    public Task<string> UploadImageAsync(IFormFile file);
    Task<string> SaveImageAsync(byte[] bytes);
    Task DeleteImageAsync(string fileName);
    Task<string> SaveImageFromUrlAsync(string imageUrl);
}