using Microsoft.EntityFrameworkCore;

public class DbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public DbContext(DbContextOptions<DbContext> options)
        : base(options) { }

    public DbSet<CrossReference> CrossReferences { get; set; } = null!;
    public DbSet<VerseReference> VerseReferences { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VerseReference>().HasKey(c => c.Id).HasName("PK_VerseReference");

        modelBuilder.Entity<CrossReference>().HasKey(c => c.Id).HasName("PK_CrossReference");

        modelBuilder
            .Entity<CrossReference>()
            .HasOne(c => c.SourceVerse)
            .WithMany(v => v.SourceCrossReferences)
            .HasForeignKey(c => c.SourceVerseId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<CrossReference>()
            .HasOne(c => c.TargetVerse)
            .WithMany(v => v.TargetCrossReferences)
            .HasForeignKey(c => c.TargetVerseId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<CrossReference>()
            .Property(c => c.CreatedAt)
            .HasDefaultValueSql("getdate()");

        modelBuilder
            .Entity<CrossReference>()
            .Property(c => c.UpdatedAt)
            .HasDefaultValueSql("getdate()");

        modelBuilder
            .Entity<VerseReference>()
            .Property(v => v.CreatedAt)
            .HasDefaultValueSql("getdate()");

        modelBuilder
            .Entity<VerseReference>()
            .Property(v => v.UpdatedAt)
            .HasDefaultValueSql("getdate()");
    }

    // Override SaveChanges to set CreatedAt and UpdatedAt properties
    // for added and modified entities
    public override int SaveChanges()
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }

        return base.SaveChanges();
    }
}
