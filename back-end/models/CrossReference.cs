public class CrossReference
{
    public int Id { get; set; }
    public int SourceVerseId { get; set; } // Foreign key
    public int TargetVerseId { get; set; } // Foreign key
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public VerseReference TargetVerse { get; set; } = null!; // Navigation property
    public VerseReference SourceVerse { get; set; } = null!; // Navigation property
}