namespace Hearth.Api.Models;

public class Chore
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string AssignedTo { get; set; } = string.Empty;

    public int? AssignedUserId { get; set; }

    public string? AssignedUserEmail { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
