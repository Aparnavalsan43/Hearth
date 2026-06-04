using Hearth.Api.Data;
using Hearth.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChoresController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChoresController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Chore>>> GetChores()
    {
        var chores = await _context.Chores.ToListAsync();

        return Ok(chores);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Chore>> GetChore(int id)
    {
        var chore = await _context.Chores.FindAsync(id);

        if (chore is null)
        {
            return NotFound();
        }

        return Ok(chore);
    }

    [HttpPost]
    public async Task<ActionResult<Chore>> CreateChore(Chore chore)
    {
        chore.DueDate = DateTime.SpecifyKind(chore.DueDate, DateTimeKind.Utc);
        chore.CreatedAt = DateTime.UtcNow;

        _context.Chores.Add(chore);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChore), new { id = chore.Id }, chore);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateChore(int id, Chore chore)
    {
        if (id != chore.Id)
        {
            return BadRequest();
        }

        chore.DueDate = DateTime.SpecifyKind(chore.DueDate, DateTimeKind.Utc);
        chore.CreatedAt = DateTime.SpecifyKind(chore.CreatedAt, DateTimeKind.Utc);

        _context.Entry(chore).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            var choreExists = await _context.Chores.AnyAsync(existingChore => existingChore.Id == id);

            if (!choreExists)
            {
                return NotFound();
            }

            throw;
        }

        return Ok(chore);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChore(int id)
    {
        var chore = await _context.Chores.FindAsync(id);

        if (chore is null)
        {
            return NotFound();
        }

        _context.Chores.Remove(chore);
        await _context.SaveChangesAsync();

        return Ok(chore);
    }
}
