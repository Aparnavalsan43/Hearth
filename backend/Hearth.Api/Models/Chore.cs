namespace Hearth.Api.Models;

public class Chore: BaseEntity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    // Legacy assignment text kept so old chores still load.
    public string AssignedTo { get; set; } = string.Empty;

    public int? AssignedToMemberId { get; set; }

    public HouseholdMember? AssignedToMember { get; set; }

    // Legacy user assignment fields kept for backward compatibility.
    public int? AssignedUserId { get; set; }

    // Legacy user assignment fields kept for backward compatibility.
    public string? AssignedUserEmail { get; set; }

    public string Category { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public bool IsCompleted { get; set; }

    //public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
