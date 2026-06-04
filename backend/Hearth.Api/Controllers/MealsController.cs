using Hearth.Api.Data;
using Hearth.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MealsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MealsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Meal>>> GetMeals()
    {
        var meals = await _context.Meals.ToListAsync();

        return Ok(meals);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Meal>> GetMeal(int id)
    {
        var meal = await _context.Meals.FindAsync(id);

        if (meal is null)
        {
            return NotFound();
        }

        return Ok(meal);
    }

    [HttpPost]
    public async Task<ActionResult<Meal>> CreateMeal(Meal meal)
    {
        meal.PlannedDate = DateTime.SpecifyKind(meal.PlannedDate, DateTimeKind.Utc);

        _context.Meals.Add(meal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMeal), new { id = meal.Id }, meal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMeal(int id, Meal meal)
    {
        if (id != meal.Id)
        {
            return BadRequest();
        }

        meal.PlannedDate = DateTime.SpecifyKind(meal.PlannedDate, DateTimeKind.Utc);

        _context.Entry(meal).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            var mealExists = await _context.Meals.AnyAsync(existingMeal => existingMeal.Id == id);

            if (!mealExists)
            {
                return NotFound();
            }

            throw;
        }

        return Ok(meal);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeal(int id)
    {
        var meal = await _context.Meals.FindAsync(id);

        if (meal is null)
        {
            return NotFound();
        }

        _context.Meals.Remove(meal);
        await _context.SaveChangesAsync();

        return Ok(meal);
    }
}
