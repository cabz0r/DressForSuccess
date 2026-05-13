using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Data;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotificationsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id, n.VolunteerId, n.ClientId, n.BookingId,
                n.Type, n.Event, n.Recipient, n.Subject, n.Body,
                n.IsRead, n.IsSent, n.SentAt, n.CreatedAt
            })
            .ToListAsync());

    [HttpGet("volunteer/{volunteerId}")]
    public async Task<IActionResult> GetForVolunteer(int volunteerId) =>
        Ok(await _db.Notifications
            .Where(n => n.VolunteerId == volunteerId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id, n.VolunteerId, n.ClientId, n.BookingId,
                n.Type, n.Event, n.Recipient, n.Subject, n.Body,
                n.IsRead, n.IsSent, n.SentAt, n.CreatedAt
            })
            .ToListAsync());

    [HttpGet("unread-count/{volunteerId}")]
    public async Task<IActionResult> GetUnreadCount(int volunteerId)
    {
        var count = await _db.Notifications
            .Where(n => n.VolunteerId == volunteerId && !n.IsRead)
            .CountAsync();
        return Ok(new { count });
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var n = await _db.Notifications.FindAsync(id);
        if (n == null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpPatch("read-all/{volunteerId}")]
    public async Task<IActionResult> MarkAllRead(int volunteerId)
    {
        await _db.Notifications
            .Where(n => n.VolunteerId == volunteerId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        return Ok();
    }
}

