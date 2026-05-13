using Microsoft.EntityFrameworkCore;
using DressForSuccess.API.Models;

namespace DressForSuccess.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Volunteer> Volunteers => Set<Volunteer>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Client)
            .WithMany(c => c.Bookings)
            .HasForeignKey(b => b.ClientId);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Volunteer)
            .WithMany(v => v.Bookings)
            .HasForeignKey(b => b.VolunteerId)
            .IsRequired(false);

        // Seed data
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Professional Blazer", Description = "Smart black blazer, perfect for interviews", Price = 25.00m, Category = "Tops", Size = "M", StockQuantity = 3 },
            new Product { Id = 2, Name = "Business Trousers", Description = "Navy tailored trousers", Price = 20.00m, Category = "Bottoms", Size = "12", StockQuantity = 5 },
            new Product { Id = 3, Name = "Dress Shirt", Description = "White formal dress shirt", Price = 15.00m, Category = "Tops", Size = "L", StockQuantity = 8 },
            new Product { Id = 4, Name = "Court Shoes", Description = "Black low heel court shoes", Price = 18.00m, Category = "Footwear", Size = "6", StockQuantity = 2 },
            new Product { Id = 5, Name = "Interview Dress", Description = "Smart navy wrap dress", Price = 30.00m, Category = "Dresses", Size = "14", StockQuantity = 4 }
        );
    }
}

