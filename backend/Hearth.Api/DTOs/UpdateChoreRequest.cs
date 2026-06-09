namespace Hearth.Api.DTOs;

public class UpdateChoreRequest
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public int? AssignedToMemberId { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public bool IsCompleted { get; set; }
}
