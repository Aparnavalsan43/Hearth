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
public class HouseholdMembersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HouseholdMembersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HouseholdMember>>> GetHouseholdMembers()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var householdMembers = await _context.HouseholdMembers
            .Where(member => member.UserId == userId)
            .OrderBy(member => member.FullName)
            .ToListAsync();

        return Ok(householdMembers);
    }

    [HttpPost]
    public async Task<ActionResult<HouseholdMember>> CreateHouseholdMember(HouseholdMember householdMember)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        householdMember.UserId = userId.Value;
        householdMember.Email = householdMember.Email.Trim().ToLower();
        householdMember.CreatedDate = DateTime.UtcNow;

        _context.HouseholdMembers.Add(householdMember);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHouseholdMembers), new { id = householdMember.Id }, householdMember);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHouseholdMember(int id)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        var householdMember = await _context.HouseholdMembers
            .FirstOrDefaultAsync(member => member.Id == id && member.UserId == userId);

        if (householdMember is null)
        {
            return NotFound();
        }

        _context.HouseholdMembers.Remove(householdMember);
        await _context.SaveChangesAsync();

        return Ok(householdMember);
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
