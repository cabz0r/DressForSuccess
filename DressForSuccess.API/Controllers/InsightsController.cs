using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Data;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsightsController : ControllerBase
{
    private readonly AppDbContext _db;
    public InsightsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetInsights()
    {
        var bookings = await _db.Bookings.Include(b => b.Client).ToListAsync();
        var clients = await _db.Clients.ToListAsync();
        var volunteers = await _db.Volunteers.Where(v => v.IsActive).CountAsync();

        // Booking status breakdown
        var statusBreakdown = bookings
            .GroupBy(b => b.Status.ToString())
            .Select(g => new { status = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToList();

        // Referral agency breakdown (clients)
        var referralBreakdown = clients
            .GroupBy(c => c.ReferralAgency.ToString())
            .Select(g => new { agency = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToList();

        // Top referral agencies by completed bookings
        var referralByCompleted = bookings
            .Where(b => b.Status == BookingStatus.Completed)
            .GroupBy(b => b.Client.ReferralAgency.ToString())
            .Select(g => new { agency = g.Key, completedBookings = g.Count() })
            .OrderByDescending(x => x.completedBookings)
            .ToList();

        // Monthly booking trends (last 6 months)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var monthlyTrends = bookings
            .Where(b => b.CreatedAt >= sixMonthsAgo)
            .GroupBy(b => b.CreatedAt.ToString("yyyy-MM"))
            .Select(g => new { month = g.Key, count = g.Count() })
            .OrderBy(x => x.month)
            .ToList();

        // Service type breakdown
        var serviceBreakdown = bookings
            .GroupBy(b => b.ServiceType)
            .Select(g => new { service = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToList();

        // Volunteer performance
        var volunteerStats = bookings
            .Where(b => b.VolunteerId != null)
            .GroupBy(b => b.VolunteerId)
            .Select(g => new
            {
                volunteerId = g.Key,
                totalBookings = g.Count(),
                completed = g.Count(b => b.Status == BookingStatus.Completed),
                cancelled = g.Count(b => b.Status == BookingStatus.Cancelled)
            })
            .ToList();

        // Summary
        var totalBookings = bookings.Count;
        var completedCount = bookings.Count(b => b.Status == BookingStatus.Completed);
        var cancelledCount = bookings.Count(b => b.Status == BookingStatus.Cancelled);
        var completionRate = totalBookings > 0 ? Math.Round((double)completedCount / totalBookings * 100, 1) : 0;
        var cancellationRate = totalBookings > 0 ? Math.Round((double)cancelledCount / totalBookings * 100, 1) : 0;

        return Ok(new
        {
            summary = new
            {
                totalClients = clients.Count,
                totalBookings,
                totalVolunteers = volunteers,
                completedBookings = completedCount,
                cancelledBookings = cancelledCount,
                completionRate,
                cancellationRate
            },
            statusBreakdown,
            referralBreakdown,
            referralByCompleted,
            monthlyTrends,
            serviceBreakdown,
            volunteerStats
        });
    }
}

