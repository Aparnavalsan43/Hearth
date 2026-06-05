using System.Security.Claims;
using Hearth.Api.Data;
using Hearth.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var notifications = await _context.Notifications
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var unreadCount = await _context.Notifications
            .CountAsync(notification => notification.UserId == userId && !notification.IsRead);

        return Ok(new { unreadCount });
    }

    [HttpPut("{id}/mark-read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(notification => notification.Id == id && notification.UserId == userId);

        if (notification is null)
        {
            return NotFound();
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok(notification);
    }

    [HttpPut("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var unreadNotifications = await _context.Notifications
            .Where(notification => notification.UserId == userId && !notification.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new { updatedCount = unreadNotifications.Count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(notification => notification.Id == id && notification.UserId == userId);

        if (notification is null)
        {
            return NotFound();
        }

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();

        return Ok(notification);
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
