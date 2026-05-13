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
            Notes = dto.Notes ?? string.Empty,
            Status = BookingStatus.Scheduled
        };
        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        // Return simple object to avoid circular reference issues
        return CreatedAtAction(nameof(Get), new { id = booking.Id }, new
        {
            booking.Id,
            booking.ClientId,
            booking.VolunteerId,
            booking.AppointmentDate,
            booking.Status,
            booking.ServiceType,
            booking.Notes,
            booking.CreatedAt
        });
    }

    [HttpPatch("{id}/assign-volunteer")]
    public async Task<IActionResult> AssignVolunteer(int id, AssignVolunteerDto dto)
    {
        var booking = await _db.Bookings.Include(b => b.Client).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound();
        var volunteer = await _db.Volunteers.FindAsync(dto.VolunteerId);
        if (volunteer == null) return BadRequest("Volunteer not found.");
        booking.VolunteerId = dto.VolunteerId;
        booking.Status = BookingStatus.Confirmed;

        // Mock Email notification to volunteer
        _db.Notifications.Add(new Notification
        {
            VolunteerId = volunteer.Id,
            ClientId = booking.ClientId,
            BookingId = booking.Id,
            Type = NotificationType.Email,
            Event = NotificationEvent.BookingAssigned,
            Recipient = volunteer.Email,
            Subject = $"New Booking Assigned - {booking.Client.FirstName} {booking.Client.LastName}",
            Body = $"Hi {volunteer.FirstName},\n\nYou have been assigned a new booking.\n\nClient: {booking.Client.FirstName} {booking.Client.LastName}\nService: {booking.ServiceType}\nDate: {booking.AppointmentDate:dddd, dd MMMM yyyy 'at' h:mm tt}\n\nPlease log in to your dashboard for full details.\n\nThank you for volunteering!\n— Dress for Success Team"
        });

        // Mock SMS notification to volunteer
        _db.Notifications.Add(new Notification
        {
            VolunteerId = volunteer.Id,
            ClientId = booking.ClientId,
            BookingId = booking.Id,
            Type = NotificationType.SMS,
            Event = NotificationEvent.BookingAssigned,
            Recipient = volunteer.Phone,
            Subject = "Booking Assigned",
            Body = $"DFS: New booking assigned. Client: {booking.Client.FirstName} {booking.Client.LastName}, {booking.AppointmentDate:dd/MM/yyyy h:mm tt}. Check your dashboard for details."
        });

        await _db.SaveChangesAsync();
        return Ok(new { booking.Id, booking.Status, booking.VolunteerId });
    }

    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> Complete(int id, CompleteBookingDto dto)
    {
        var booking = await _db.Bookings.Include(b => b.Client).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound();
        booking.Status = BookingStatus.Completed;
        booking.CompletedAt = DateTime.UtcNow;
        booking.OutcomeNotes = dto.OutcomeNotes;

        // Mock Email notification to client
        _db.Notifications.Add(new Notification
        {
            ClientId = booking.ClientId,
            BookingId = booking.Id,
            Type = NotificationType.Email,
            Event = NotificationEvent.BookingCompleted,
            Recipient = booking.Client.Email,
            Subject = "Your Appointment is Complete - Dress for Success",
            Body = $"Hi {booking.Client.FirstName},\n\nThank you for attending your {booking.ServiceType} appointment on {booking.AppointmentDate:dd MMMM yyyy}.\n\nWe hope you feel confident and ready for your next steps. If you need another appointment, visit our website to book again.\n\nWishing you every success!\n— Dress for Success Team"
        });

        await _db.SaveChangesAsync();
        return Ok(new { booking.Id, booking.Status, booking.CompletedAt });
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancelBookingDto dto)
    {
        var booking = await _db.Bookings.Include(b => b.Client).FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound();
        booking.Status = BookingStatus.Cancelled;
        booking.CancellationReason = dto.CancellationReason;

        // Mock Email notification to volunteer (if assigned)
        if (booking.VolunteerId != null)
        {
            var volunteer = await _db.Volunteers.FindAsync(booking.VolunteerId);
            if (volunteer != null)
            {
                _db.Notifications.Add(new Notification
                {
                    VolunteerId = volunteer.Id,
                    ClientId = booking.ClientId,
                    BookingId = booking.Id,
                    Type = NotificationType.Email,
                    Event = NotificationEvent.BookingCancelled,
                    Recipient = volunteer.Email,
                    Subject = $"Booking Cancelled - {booking.Client.FirstName} {booking.Client.LastName}",
                    Body = $"Hi {volunteer.FirstName},\n\nThe following booking has been cancelled.\n\nClient: {booking.Client.FirstName} {booking.Client.LastName}\nService: {booking.ServiceType}\nDate: {booking.AppointmentDate:dddd, dd MMMM yyyy 'at' h:mm tt}\nReason: {dto.CancellationReason}\n\nThis time slot is now free in your schedule.\n\n— Dress for Success Team"
                });

                // Mock SMS
                _db.Notifications.Add(new Notification
                {
                    VolunteerId = volunteer.Id,
                    ClientId = booking.ClientId,
                    BookingId = booking.Id,
                    Type = NotificationType.SMS,
                    Event = NotificationEvent.BookingCancelled,
                    Recipient = volunteer.Phone,
                    Subject = "Booking Cancelled",
                    Body = $"DFS: Booking cancelled. {booking.Client.FirstName} {booking.Client.LastName} on {booking.AppointmentDate:dd/MM h:mm tt}. Reason: {dto.CancellationReason}"
                });
            }
        }

        // Mock SMS to client
        _db.Notifications.Add(new Notification
        {
            ClientId = booking.ClientId,
            BookingId = booking.Id,
            Type = NotificationType.SMS,
            Event = NotificationEvent.BookingCancelled,
            Recipient = booking.Client.Phone,
            Subject = "Booking Cancelled",
            Body = $"Hi {booking.Client.FirstName}, your {booking.ServiceType} appointment on {booking.AppointmentDate:dd/MM/yyyy} has been cancelled. Please contact us to rebook. — Dress for Success"
        });

        await _db.SaveChangesAsync();
        return Ok(new { booking.Id, booking.Status, booking.CancellationReason });
    }
}

