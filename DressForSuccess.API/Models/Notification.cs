namespace DressForSuccess.API.Models;

public enum NotificationType
{
    Email = 0,
    SMS = 1
}

public enum NotificationEvent
{
    BookingAssigned = 0,
    BookingCancelled = 1,
    BookingCompleted = 2,
    BookingReminder = 3
}

public class Notification
{
    public int Id { get; set; }
    public int? VolunteerId { get; set; }
    public Volunteer? Volunteer { get; set; }
    public int? ClientId { get; set; }
    public Client? Client { get; set; }
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }
    public NotificationType Type { get; set; }
    public NotificationEvent Event { get; set; }
    public string Recipient { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public bool IsSent { get; set; } = true; // Mock: always "sent"
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

