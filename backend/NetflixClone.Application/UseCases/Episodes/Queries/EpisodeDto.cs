namespace NetflixClone.Application.UseCases.Episodes.Queries.GetEpisodesByContentId;

public class EpisodeDto
{
    public Guid Id { get; set; }
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public int Duration { get; set; }
    public Guid ContentId { get; set; }
}