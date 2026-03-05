using MediatR;
using NetflixClone.Domain.Entities;
using NetflixClone.Domain.Interfaces;
using NetflixClone.Application.UseCases.Watchlist.Commands.AddToWatchlist;

namespace NetflixClone.Application.UseCases.Watchlist.Commands.AddToWatchlist;

public class AddToWatchlistCommandHandler 
    : IRequestHandler<AddToWatchlistCommand, Guid>
{
    private readonly IWatchlistRepository _watchlistRepository;

    public AddToWatchlistCommandHandler(IWatchlistRepository watchlistRepository)
    {
        _watchlistRepository = watchlistRepository;
    }

    public async Task<Guid> Handle(AddToWatchlistCommand request, CancellationToken cancellationToken)
    {
        var existingWatchlist = await _watchlistRepository
            .GetByUserAndContentAsync(request.UserId, request.ContentId, cancellationToken);

        if (existingWatchlist != null)
            throw new InvalidOperationException("Цей фільм вже у вашому Списку на потім");

        var watchlistItem = new Watchlist
        {
            Id = Guid.NewGuid(), 
            UserId = request.UserId, 
            ContentId = request.ContentId
        };

        await _watchlistRepository.AddAsync(watchlistItem, cancellationToken);

        return watchlistItem.Id;
    }
}