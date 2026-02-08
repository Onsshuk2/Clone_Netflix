using AutoMapper;
using MediatR;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Constants;
using NetflixClone.Domain.Entities;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Episodes.Commands.AddEpisode;

public class AddEpisodeHandler : IRequestHandler<AddEpisodeCommand, Guid>
{
    private readonly IEpisodeRepository _episodeRepository;
    private readonly IContentRepository _contentRepository;
    private readonly IVideoService _videoService;
    private readonly IMapper _mapper;

    public AddEpisodeHandler(
        IEpisodeRepository episodeRepository,
        IContentRepository contentRepository,
        IVideoService videoService,
        IMapper mapper)
    {
        _episodeRepository = episodeRepository;
        _contentRepository = contentRepository;
        _videoService = videoService;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(AddEpisodeCommand request, CancellationToken ct)
    {
        var content = await _contentRepository.GetByIdAsync(request.ContentId, ct);
        if (content == null)
            throw new Exception("Контент (сезон) не знайдено.");

        var episode = _mapper.Map<Episode>(request);

        string folder = $"{MediaFolders.Episodes}/{request.ContentId}";
        episode.VideoUrl = await _videoService.UploadAsync(request.VideoFile, folder);

        await _episodeRepository.AddAsync(episode, ct);

        return episode.Id;
    }
}