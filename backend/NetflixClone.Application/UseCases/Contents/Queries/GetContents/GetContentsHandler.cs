using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetflixClone.Application.Common;
using NetflixClone.Domain.Interfaces;

namespace NetflixClone.Application.UseCases.Contents.Queries.GetContents;

public class GetContentsHandler : IRequestHandler<GetContentsQuery, PagedResponse<ContentDto>>
{
    private readonly IContentRepository _contentRepository;
    private readonly IMapper _mapper;

    public GetContentsHandler(IContentRepository contentRepository, IMapper mapper)
    {
        _contentRepository = contentRepository;
        _mapper = mapper;
    }

    public async Task<PagedResponse<ContentDto>> Handle(GetContentsQuery request, CancellationToken ct)
    {
        // 1. Беремо "заготовку" запиту (IQueryable)
        var query = _contentRepository.GetQueryable();

        // 3. Додаємо пошук по назві
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            query = query.Where(c => c.Title.ToLower().Contains(request.SearchTerm.ToLower()));

        // 4. Фільтрація за жанром (через Many-to-Many)
        if (request.GenreId.HasValue)
            query = query.Where(c => c.Genres.Any(g => g.Id == request.GenreId.Value));

        if (request.CollectionId.HasValue)
        {
            query = query.Where(c => c.Collections.Any(col => col.Id == request.CollectionId.Value));
        }

        // 5. Динамічне сортування
        query = request.SortBy?.ToLower() switch
        {
            "rating" => query.OrderByDescending(c => c.Rating),
            "year" => query.OrderByDescending(c => c.ReleaseYear),
            _ => query.OrderByDescending(c => c.CreatedAt) // за замовчуванням - найновіші
        };

        // 6. Рахуємо кількість до пагінації (для фронтенду)
        var totalCount = await query.CountAsync(ct);

        // 7. Виконуємо пагінацію та мапінг
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<ContentDto>(_mapper.ConfigurationProvider) // Мапимо відразу в SQL запиті
            .ToListAsync(ct);

        return new PagedResponse<ContentDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}