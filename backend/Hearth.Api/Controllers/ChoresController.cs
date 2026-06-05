using System.Security.Claims;
using Hearth.Api.Data;
using Hearth.Api.Models;
using Hearth.Api.Services;
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
    private readonly IEmailService _emailService;
    private readonly ILogger<ChoresController> _logger;

    public ChoresController(
        ApplicationDbContext context,
        IEmailService emailService,
        ILogger<ChoresController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
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
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        chore.DueDate = DateTime.SpecifyKind(chore.DueDate, DateTimeKind.Utc);
        chore.CreatedAt = DateTime.UtcNow;
        chore.UserId = currentUserId.Value;

        var assignedUser = await ResolveAssignedUserAsync(chore);

        _context.Chores.Add(chore);
        await _context.SaveChangesAsync();

        if (assignedUser is not null)
        {
            var notification = new Notification
            {
                UserId = assignedUser.Id,
                Title = "New Chore Assigned",
                Message = $"You have been assigned a chore: {chore.Title}",
                Type = "ChoreAssigned",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        var assignedEmail = assignedUser?.Email ?? chore.AssignedUserEmail;

        if (!string.IsNullOrWhiteSpace(assignedEmail))
        {
            try
            {
                await _emailService.SendEmailAsync(
                    assignedEmail,
                    "New Chore Assigned in Hearth",
                    "You have been assigned a chore.");
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to send chore assignment email to {Email}", assignedEmail);
            }
        }

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

    private async Task<User?> ResolveAssignedUserAsync(Chore chore)
    {
        User? assignedUser = null;

        if (chore.AssignedUserId is not null)
        {
            assignedUser = await _context.Users.FindAsync(chore.AssignedUserId);
        }

        if (assignedUser is null && !string.IsNullOrWhiteSpace(chore.AssignedUserEmail))
        {
            var assignedEmail = chore.AssignedUserEmail.Trim().ToLower();
            assignedUser = await _context.Users.FirstOrDefaultAsync(user => user.Email == assignedEmail);
            chore.AssignedUserEmail = assignedEmail;
        }

        if (assignedUser is not null)
        {
            chore.AssignedUserId = assignedUser.Id;
            chore.AssignedUserEmail = assignedUser.Email;

            if (string.IsNullOrWhiteSpace(chore.AssignedTo))
            {
                chore.AssignedTo = assignedUser.FullName;
            }
        }

        return assignedUser;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (int.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }

        return null;
    }
}
