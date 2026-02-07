using AutoMapper;
using MediatR;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Constants;
using NetflixClone.Domain.Entities;
using NetflixClone.Domain.Enums;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Contents.Commands.CreateContent;

public class CreateContentHandler : IRequestHandler<CreateContentCommand, Guid>
{
    private readonly IContentRepository _contentRepository;
    private readonly IGenreRepository _genreRepository;
    private readonly ICollectionRepository _collectionRepository;
    private readonly IImageService _imageService;
    private readonly IVideoService _videoService;
    private readonly IMapper _mapper;

    public CreateContentHandler(
        IContentRepository contentRepository,
        IGenreRepository genreRepository,
        ICollectionRepository collectionRepository,
        IImageService imageService,
        IVideoService videoService,
        IMapper mapper)
    {
        _contentRepository = contentRepository;
        _genreRepository = genreRepository;
        _collectionRepository = collectionRepository;
        _imageService = imageService;
        _videoService = videoService;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateContentCommand request, CancellationToken ct)
    {
        var content = _mapper.Map<Content>(request);

        // 2. Обробка зображень
        content.PosterUrl = await _imageService.UploadAsync(
            request.PosterFile,
            MediaFolders.Posters,
            ImageSizeConstants.PosterWidth,
            ImageSizeConstants.PosterHeight
            );

        content.DetailsPosterUrl = await _imageService.UploadAsync(
            request.DetailsPosterFile,
            MediaFolders.Backdrops,
            ImageSizeConstants.BackdropWidth,
            ImageSizeConstants.BackdropHeight
            );

        if (string.IsNullOrEmpty(content.PosterUrl) || string.IsNullOrEmpty(content.DetailsPosterUrl))
        {
            throw new Exception("Помилка завантаження зображень.");
        }

        if (request.Type == ContentType.Movie && request.VideoFile != null)
        {
            content.FullVideoUrl = await _videoService.UploadAsync(request.VideoFile, MediaFolders.Movies);

            if (string.IsNullOrEmpty(content.FullVideoUrl))
            {
                throw new Exception("Помилка завантаження відеофайлу.");
            }
        }

        if (request.GenreIds.Any())
        {
            var genres = await _genreRepository.FindAsync(g => request.GenreIds.Contains(g.Id), ct);
            foreach (var genre in genres) content.Genres.Add(genre);
        }

        if (request.CollectionIds.Any())
        {
            var collections = await _collectionRepository.FindAsync(c => request.CollectionIds.Contains(c.Id), ct);
            foreach (var col in collections) content.Collections.Add(col);
        }

        await _contentRepository.AddAsync(content, ct);
        return content.Id;
    }
}