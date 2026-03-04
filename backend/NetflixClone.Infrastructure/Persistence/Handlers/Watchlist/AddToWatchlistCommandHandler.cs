using MediatR;
using Microsoft.EntityFrameworkCore;
using NetflixClone.Domain.Entities;
using NetflixClone.Infrastructure.Persistence;

namespace NetflixClone.Infrastructure.Persistence.Handlers.Watchlist;

public class AddToWatchlistCommandHandler : IRequestHandler<NetflixClone.Application.UseCases.Watchlist.Commands.AddToWatchlist.AddToWatchlistCommand, Guid>
{
    private readonly ApplicationDbContext _context;

    public AddToWatchlistCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(NetflixClone.Application.UseCases.Watchlist.Commands.AddToWatchlist.AddToWatchlistCommand request, CancellationToken cancellationToken)
    {
        var existingWatchlist = await _context.Watchlists
            .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.ContentId == request.ContentId, cancellationToken);

        if (existingWatchlist != null)
            throw new InvalidOperationException("Цей фільм вже у вашому Списку на потім");

        var watchlistItem = new NetflixClone.Domain.Entities.Watchlist
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            ContentId = request.ContentId,
            AddedAt = DateTime.UtcNow,
            IsWatched = false
        };

        _context.Watchlists.Add(watchlistItem);
        await _context.SaveChangesAsync(cancellationToken);

        return watchlistItem.Id;
    }
}