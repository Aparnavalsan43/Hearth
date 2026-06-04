using Hearth.Api.Data;
using Hearth.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BillsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BillsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bill>>> GetBills()
    {
        var bills = await _context.Bills.ToListAsync();

        return Ok(bills);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Bill>> GetBill(int id)
    {
        var bill = await _context.Bills.FindAsync(id);

        if (bill is null)
        {
            return NotFound();
        }

        return Ok(bill);
    }

    [HttpPost]
    public async Task<ActionResult<Bill>> CreateBill(Bill bill)
    {
        bill.DueDate = DateTime.SpecifyKind(bill.DueDate, DateTimeKind.Utc);

        _context.Bills.Add(bill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBill), new { id = bill.Id }, bill);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBill(int id, Bill bill)
    {
        if (id != bill.Id)
        {
            return BadRequest();
        }

        bill.DueDate = DateTime.SpecifyKind(bill.DueDate, DateTimeKind.Utc);

        _context.Entry(bill).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            var billExists = await _context.Bills.AnyAsync(existingBill => existingBill.Id == id);

            if (!billExists)
            {
                return NotFound();
            }

            throw;
        }

        return Ok(bill);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBill(int id)
    {
        var bill = await _context.Bills.FindAsync(id);

        if (bill is null)
        {
            return NotFound();
        }

        _context.Bills.Remove(bill);
        await _context.SaveChangesAsync();

        return Ok(bill);
    }
}
