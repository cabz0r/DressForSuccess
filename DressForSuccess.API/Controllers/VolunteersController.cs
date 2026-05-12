using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Data;
using DressForSuccess.API.DTOs;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VolunteersController : ControllerBase
{
    private readonly AppDbContext _db;
    public VolunteersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Volunteers
            .Where(v => v.IsActive)
            .Select(v => new { v.Id, v.FirstName, v.LastName, v.Email, v.Phone, v.CreatedAt })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var v = await _db.Volunteers
            .Include(v => v.Bookings).ThenInclude(b => b.Client)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (v == null) return NotFound();
        return Ok(new
        {
            v.Id, v.FirstName, v.LastName, v.Email, v.Phone, v.CreatedAt,
            Bookings = v.Bookings.Select(b => new
            {
                b.Id, b.AppointmentDate, b.Status, b.ServiceType,
                ClientName = $"{b.Client.FirstName} {b.Client.LastName}"
            })
        });
    }
}

