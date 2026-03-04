using MediatR;
using Microsoft.EntityFrameworkCore;
using NetflixClone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace NetflixClone.Application.UseCases.Watchlist.Queries.GetWatchlist;

public class GetWatchlistQueryHandler : IRequestHandler<GetWatchlistQuery, List<WatchlistDto>>
{
    private readonly ApplicationDbContext _context;

    public GetWatchlistQueryHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WatchlistDto>> Handle(GetWatchlistQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Watchlists
            .Where(w => w.UserId == request.UserId);

        if (request.OnlyUnwatched.HasValue && request.OnlyUnwatched.Value)
            query = query.Where(w => !w.IsWatched);

        return await query
            .Include(w => w.Content)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WatchlistDto
            {
                Id = w.Id,
                ContentId = w.Content.Id,
                Title = w.Content.Title,
                PosterUrl = w.Content.PosterUrl,
                Rating = w.Content.Rating,
                AddedAt = w.AddedAt,
                IsWatched = w.IsWatched,
                WatchedAt = w.WatchedAt
            })
            .ToListAsync(cancellationToken);
    }
}