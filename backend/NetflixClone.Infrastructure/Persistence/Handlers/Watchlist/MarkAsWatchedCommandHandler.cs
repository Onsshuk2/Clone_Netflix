using MediatR;
using NetflixClone.Infrastructure.Persistence;

namespace NetflixClone.Application.UseCases.Watchlist.Commands.MarkAsWatched;

public class MarkAsWatchedCommandHandler : IRequestHandler<MarkAsWatchedCommand>
{
    private readonly ApplicationDbContext _context;

    public MarkAsWatchedCommandHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(MarkAsWatchedCommand request, CancellationToken cancellationToken)
    {
        var watchlist = await _context.Watchlists.FindAsync(new object[] { request.WatchlistId }, cancellationToken: cancellationToken);

        if (watchlist == null)
            throw new InvalidOperationException("Елемент не знайдено");

        if (watchlist.UserId != request.UserId)
            throw new UnauthorizedAccessException("Ви не маєте доступу до цього елемента");

        watchlist.IsWatched = true;
        watchlist.WatchedAt = DateTime.UtcNow;

        _context.Watchlists.Update(watchlist);
        await _context.SaveChangesAsync(cancellationToken);
    }
}