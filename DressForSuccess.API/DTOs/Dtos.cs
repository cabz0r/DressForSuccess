namespace DressForSuccess.API.DTOs;

public record RegisterVolunteerDto(string FirstName, string LastName, string Email, string Password, string Phone);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, int Id, string FirstName, string LastName, string Email);

public record CreateClientDto(
    string FirstName, string LastName, string Email, string Phone,
    string Address, int ReferralAgency, string Notes);

public record CreateBookingDto(
    int ClientId, int? VolunteerId, DateTime AppointmentDate,
    string ServiceType, string Notes);

public record AssignVolunteerDto(int VolunteerId);

public record CompleteBookingDto(string OutcomeNotes);

public record CancelBookingDto(string CancellationReason);

public record ChatMessageDto(string Message, List<ChatHistoryItem> History);
public record ChatHistoryItem(string Role, string Content);

public record CreateProductDto(
    string Name, string Description, decimal Price,
    string Category, string Size, string ImageUrl, int StockQuantity);

