using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DressForSuccess.API.Data;
using DressForSuccess.API.DTOs;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterVolunteerDto dto)
    {
        if (await _db.Volunteers.AnyAsync(v => v.Email == dto.Email))
            return BadRequest("Email already registered.");

        var volunteer = new Volunteer
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        _db.Volunteers.Add(volunteer);
        await _db.SaveChangesAsync();
        return Ok(new AuthResponseDto(GenerateToken(volunteer), volunteer.Id, volunteer.FirstName, volunteer.LastName, volunteer.Email));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var volunteer = await _db.Volunteers.FirstOrDefaultAsync(v => v.Email == dto.Email);
        if (volunteer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, volunteer.PasswordHash))
            return Unauthorized("Invalid credentials.");

        return Ok(new AuthResponseDto(GenerateToken(volunteer), volunteer.Id, volunteer.FirstName, volunteer.LastName, volunteer.Email));
    }

    private string GenerateToken(Volunteer volunteer)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "DressForSuccessSecretKey123456789!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, volunteer.Id.ToString()),
            new Claim(ClaimTypes.Email, volunteer.Email),
            new Claim(ClaimTypes.Name, $"{volunteer.FirstName} {volunteer.LastName}")
        };
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

