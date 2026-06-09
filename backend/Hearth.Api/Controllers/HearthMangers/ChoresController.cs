using System.Security.Claims;
using Hearth.Api.DTOs;
using Hearth.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hearth.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChoresController : ControllerBase
{
    private readonly IChoreService _choreService;

    public ChoresController(IChoreService choreService)
    {
        _choreService = choreService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChoreResponse>>> GetChores()
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var chores = await _choreService.GetChoresAsync(currentUserId.Value);

        return Ok(chores);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChoreResponse>> GetChore(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var chore = await _choreService.GetChoreAsync(currentUserId.Value, id);

        if (chore is null)
        {
            return NotFound();
        }

        return Ok(chore);
    }

    [HttpPost]
    public async Task<ActionResult<ChoreResponse>> CreateChore(CreateChoreRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        try
        {
            var chore = await _choreService.CreateChoreAsync(currentUserId.Value, request);

            return CreatedAtAction(nameof(GetChore), new { id = chore.Id }, chore);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateChore(int id, UpdateChoreRequest request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        if (id != request.Id)
        {
            return BadRequest();
        }

        try
        {
            var chore = await _choreService.UpdateChoreAsync(currentUserId.Value, id, request);

            if (chore is null)
            {
                return NotFound();
            }

            return Ok(chore);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteChore(int id)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var chore = await _choreService.DeleteChoreAsync(currentUserId.Value, id);

        if (chore is null)
        {
            return NotFound();
        }

        return Ok(chore);
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
