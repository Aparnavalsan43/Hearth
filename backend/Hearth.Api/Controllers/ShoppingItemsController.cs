using Hearth.Api.Data;
using Hearth.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ShoppingItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ShoppingItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShoppingItem>>> GetShoppingItems()
    {
        var shoppingItems = await _context.ShoppingItems.ToListAsync();

        return Ok(shoppingItems);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShoppingItem>> GetShoppingItem(int id)
    {
        var shoppingItem = await _context.ShoppingItems.FindAsync(id);

        if (shoppingItem is null)
        {
            return NotFound();
        }

        return Ok(shoppingItem);
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingItem>> CreateShoppingItem(ShoppingItem shoppingItem)
    {
        shoppingItem.CreatedAt = DateTime.UtcNow;

        _context.ShoppingItems.Add(shoppingItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetShoppingItem), new { id = shoppingItem.Id }, shoppingItem);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShoppingItem(int id, ShoppingItem shoppingItem)
    {
        if (id != shoppingItem.Id)
        {
            return BadRequest();
        }

        shoppingItem.CreatedAt = DateTime.SpecifyKind(shoppingItem.CreatedAt, DateTimeKind.Utc);

        _context.Entry(shoppingItem).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            var shoppingItemExists = await _context.ShoppingItems.AnyAsync(existingItem => existingItem.Id == id);

            if (!shoppingItemExists)
            {
                return NotFound();
            }

            throw;
        }

        return Ok(shoppingItem);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShoppingItem(int id)
    {
        var shoppingItem = await _context.ShoppingItems.FindAsync(id);

        if (shoppingItem is null)
        {
            return NotFound();
        }

        _context.ShoppingItems.Remove(shoppingItem);
        await _context.SaveChangesAsync();

        return Ok(shoppingItem);
    }
}
