using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Data;
using DressForSuccess.API.DTOs;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ClientsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Clients.Include(c => c.Bookings).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var client = await _db.Clients.Include(c => c.Bookings).FirstOrDefaultAsync(c => c.Id == id);
        return client == null ? NotFound() : Ok(client);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClientDto dto)
    {
        var client = new Client
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            ReferralAgency = (ReferralAgency)dto.ReferralAgency,
            Notes = dto.Notes
        };
        _db.Clients.Add(client);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = client.Id }, client);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateClientDto dto)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client == null) return NotFound();
        client.FirstName = dto.FirstName;
        client.LastName = dto.LastName;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Address = dto.Address;
        client.ReferralAgency = (ReferralAgency)dto.ReferralAgency;
        client.Notes = dto.Notes;
        await _db.SaveChangesAsync();
        return Ok(client);
    }

    [HttpGet("referral-agencies")]
    public IActionResult GetReferralAgencies()
    {
        var agencies = Enum.GetValues<ReferralAgency>()
            .Select(e => new { value = (int)e, label = e.ToString() });
        return Ok(agencies);
    }
}

