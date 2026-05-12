namespace DressForSuccess.API.Models;

public enum BookingStatus
{
    Scheduled = 0,
    Confirmed = 1,
    Completed = 2,
    Cancelled = 3,
    NoShow = 4
}

public class Booking
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public int? VolunteerId { get; set; }
    public Volunteer? Volunteer { get; set; }
    public DateTime AppointmentDate { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Scheduled;
    public string Notes { get; set; } = string.Empty;
    public string ServiceType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? CancellationReason { get; set; }
    public string? OutcomeNotes { get; set; }
}

