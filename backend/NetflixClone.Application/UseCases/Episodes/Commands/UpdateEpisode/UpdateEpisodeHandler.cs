using AutoMapper;
using MediatR;
using NetflixClone.Application.Interfaces;
using NetflixClone.Domain.Constants;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Episodes.Commands.UpdateEpisode;

public class UpdateEpisodeHandler : IRequestHandler<UpdateEpisodeCommand>
{
    private readonly IEpisodeRepository _episodeRepository;
    private readonly IVideoService _videoService;
    private readonly IMapper _mapper;

    public UpdateEpisodeHandler(IEpisodeRepository episodeRepository, IVideoService videoService, IMapper mapper)
    {
        _episodeRepository = episodeRepository;
        _videoService = videoService;
        _mapper = mapper;
    }

    public async Task Handle(UpdateEpisodeCommand request, CancellationToken ct)
    {
        var episode = await _episodeRepository.GetByIdAsync(request.Id, ct);
        if (episode == null) throw new Exception("Епізод не знайдено.");

        if (request.VideoFile != null)
        {
            await _videoService.DeleteAsync(episode.VideoUrl);

            string folder = $"{MediaFolders.Episodes}/{episode.ContentId}";
            episode.VideoUrl = await _videoService.UploadAsync(request.VideoFile, folder);
        }

        _mapper.Map(request, episode);

        await _episodeRepository.UpdateAsync(episode, ct);
    }
}