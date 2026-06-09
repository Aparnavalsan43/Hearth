namespace Hearth.Api.Models;

public class Meal : BaseEntity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string MealName { get; set; } = string.Empty;

    public string MealType { get; set; } = string.Empty;

    public DateTime PlannedDate { get; set; }

   // public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
