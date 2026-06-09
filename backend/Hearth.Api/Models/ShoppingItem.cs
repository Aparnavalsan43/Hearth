namespace Hearth.Api.Models;

public class ShoppingItem : BaseEntity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string ItemName { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public bool IsPurchased { get; set; }

    //public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
