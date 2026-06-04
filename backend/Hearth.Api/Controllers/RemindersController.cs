using Hearth.Api.Data;
using Hearth.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RemindersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Reminder>>> GetReminders()
    {
        var reminders = await _context.Reminders.ToListAsync();

        return Ok(reminders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Reminder>> GetReminder(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);

        if (reminder is null)
        {
            return NotFound();
        }

        return Ok(reminder);
    }

    [HttpPost]
    public async Task<ActionResult<Reminder>> CreateReminder(Reminder reminder)
    {
        reminder.ReminderDate = DateTime.SpecifyKind(reminder.ReminderDate, DateTimeKind.Utc);

        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReminder), new { id = reminder.Id }, reminder);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReminder(int id, Reminder reminder)
    {
        if (id != reminder.Id)
        {
            return BadRequest();
        }

        reminder.ReminderDate = DateTime.SpecifyKind(reminder.ReminderDate, DateTimeKind.Utc);

        _context.Entry(reminder).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            var reminderExists = await _context.Reminders.AnyAsync(existingReminder => existingReminder.Id == id);

            if (!reminderExists)
            {
                return NotFound();
            }

            throw;
        }

        return Ok(reminder);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReminder(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);

        if (reminder is null)
        {
            return NotFound();
        }

        _context.Reminders.Remove(reminder);
        await _context.SaveChangesAsync();

        return Ok(reminder);
    }
}
