namespace Hearth.Api.DTOs;

public class ChoreResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public int? AssignedToMemberId { get; set; }

    public string? AssignedMemberName { get; set; }

    public string? AssignedMemberEmail { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedDate { get; set; }
}
