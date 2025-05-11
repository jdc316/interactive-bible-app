public class VerseReference
{
    public int Id { get; set; }
    public required string Book { get; set; }
    public required int Chapter { get; set; }
    public required int Verse { get; set; }
    public required string Text { get; set; }
    public string? Translation { get; set; }
    public string? Language { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public virtual ICollection<CrossReference> SourceCrossReferences { get; set; } = new HashSet<CrossReference>();
    public virtual ICollection<CrossReference> TargetCrossReferences { get; set; } = new HashSet<CrossReference>();
}