using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Data;
using DressForSuccess.API.DTOs;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category = null)
    {
        var query = _db.Products.Where(p => p.IsAvailable);
        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);
        return Ok(await query.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var product = await _db.Products.FindAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Category = dto.Category,
            Size = dto.Size,
            ImageUrl = dto.ImageUrl,
            StockQuantity = dto.StockQuantity
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories() =>
        Ok(await _db.Products.Select(p => p.Category).Distinct().ToListAsync());
}

