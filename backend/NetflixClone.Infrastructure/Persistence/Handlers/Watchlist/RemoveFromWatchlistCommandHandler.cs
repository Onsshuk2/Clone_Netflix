using MediatR;
using NetflixClone.Infrastructure.Persistence;

namespace NetflixClone.Application.UseCases.Watchlist.Commands.RemoveFromWatchlist;

public class RemoveFromWatchlistCommandHandler : IRequestHandler<RemoveFromWatchlistCommand>
{
    private readonly ApplicationDbContext _context;

    public RemoveFromWatchlistCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(RemoveFromWatchlistCommand request, CancellationToken cancellationToken)
    {
        var watchlist = await _context.Watchlists.FindAsync(new object[] { request.WatchlistId }, cancellationToken: cancellationToken);

        if (watchlist == null)
            throw new InvalidOperationException("Елемент не знайдено");

        if (watchlist.UserId != request.UserId)
            throw new UnauthorizedAccessException("Ви не маєте доступу до цього елемента");

        _context.Watchlists.Remove(watchlist);
        await _context.SaveChangesAsync(cancellationToken);
    }
}