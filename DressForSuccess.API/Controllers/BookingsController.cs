using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Data;
using DressForSuccess.API.DTOs;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BookingsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Bookings.Include(b => b.Client).Include(b => b.Volunteer).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var booking = await _db.Bookings
            .Include(b => b.Client)
            .Include(b => b.Volunteer)
            .FirstOrDefaultAsync(b => b.Id == id);
        return booking == null ? NotFound() : Ok(booking);
    }

    [HttpGet("volunteer/{volunteerId}")]
    public async Task<IActionResult> GetByVolunteer(int volunteerId) =>
        Ok(await _db.Bookings
            .Include(b => b.Client)
            .Where(b => b.VolunteerId == volunteerId)
            .ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Create(CreateBookingDto dto)
    {
        var client = await _db.Clients.FindAsync(dto.ClientId);
        if (client == null) return BadRequest("Client not found.");

        var booking = new Booking
        {
            ClientId = dto.ClientId,
            VolunteerId = dto.VolunteerId,
            AppointmentDate = dto.AppointmentDate,
            ServiceType = dto.ServiceType,
            Notes = dto.Notes,
            Status = BookingStatus.Scheduled
        };
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = booking.Id },
            await _db.Bookings.Include(b => b.Client).Include(b => b.Volunteer).FirstAsync(b => b.Id == booking.Id));
    }

    [HttpPatch("{id}/assign-volunteer")]
    public async Task<IActionResult> AssignVolunteer(int id, AssignVolunteerDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        var volunteer = await _db.Volunteers.FindAsync(dto.VolunteerId);
        if (volunteer == null) return BadRequest("Volunteer not found.");
        booking.VolunteerId = dto.VolunteerId;
        booking.Status = BookingStatus.Confirmed;
        await _db.SaveChangesAsync();
        return Ok(booking);
    }

    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> Complete(int id, CompleteBookingDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        booking.Status = BookingStatus.Completed;
        booking.CompletedAt = DateTime.UtcNow;
        booking.OutcomeNotes = dto.OutcomeNotes;
        await _db.SaveChangesAsync();
        return Ok(booking);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancelBookingDto dto)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        booking.Status = BookingStatus.Cancelled;
        booking.CancellationReason = dto.CancellationReason;
        await _db.SaveChangesAsync();
        return Ok(booking);
    }
}

