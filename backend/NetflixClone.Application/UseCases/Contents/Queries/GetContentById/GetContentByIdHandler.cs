using AutoMapper;
using MediatR;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Contents.Queries.GetContentById;

public class GetContentByIdHandler : IRequestHandler<GetContentByIdQuery, ContentDetailDto>
{
    private readonly IContentRepository _contentRepository;
    private readonly IMapper _mapper;

    public GetContentByIdHandler(IContentRepository contentRepository, IMapper mapper)
    {
        _contentRepository = contentRepository;
        _mapper = mapper;
    }

    public async Task<ContentDetailDto> Handle(GetContentByIdQuery request, CancellationToken ct)
    {
        var content = await _contentRepository.GetByIdWithDetailsAsync(request.Id, ct);

        if (content == null)
            throw new Exception("Контент не знайдено.");

        return _mapper.Map<ContentDetailDto>(content);
    }
}