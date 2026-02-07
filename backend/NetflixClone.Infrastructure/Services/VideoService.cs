using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NetflixClone.Application.Interfaces;

namespace NetflixClone.Infrastructure.Services;

public class VideoService(IConfiguration configuration) : IVideoService
{
    private const string RootMediaFolder = "media";
    private string DirVideoName => configuration["DirVideoName"] ?? "videos";

    public async Task<string> UploadAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0) return string.Empty;

        try
        {
            var fileName = Path.GetRandomFileName() + Path.GetExtension(file.FileName);
            // Шлях для БД: "videos/movies/name.mp4"
            var pathInDb = Path.Combine(DirVideoName, subFolder, fileName).Replace("\\", "/");
            var fullPath = GetFullDiskPath(pathInDb);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return pathInDb;
        }
        catch { return string.Empty; }
    }

    public async Task DeleteAsync(string pathInDb)
    {
        if (string.IsNullOrEmpty(pathInDb)) return;

        var fullPath = GetFullDiskPath(pathInDb);

        await Task.Run(() =>
        {
            if (File.Exists(fullPath)) File.Delete(fullPath);
        });
    }

    private string GetFullDiskPath(string pathInDb) =>
        Path.Combine(Directory.GetCurrentDirectory(), RootMediaFolder, pathInDb);
}