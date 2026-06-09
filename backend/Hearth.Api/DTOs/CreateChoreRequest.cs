namespace Hearth.Api.DTOs;

public class CreateChoreRequest
{
    public string Title { get; set; } = string.Empty;

    public int? AssignedToMemberId { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public bool IsCompleted { get; set; }
}
