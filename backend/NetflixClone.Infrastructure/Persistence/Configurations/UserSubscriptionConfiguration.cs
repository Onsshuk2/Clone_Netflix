using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using NetflixClone.Domain.Entities;

namespace NetflixClone.Infrastructure.Persistence.Configurations;

public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
{
    public void Configure(EntityTypeBuilder<UserSubscription> builder)
    {
        builder.HasKey(us => us.Id);

        builder.HasOne(us => us.User)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(us => us.Plan)
            .WithMany(p => p.UserSubscriptions)
            .HasForeignKey(us => us.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
