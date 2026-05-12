using Microsoft.AspNetCore.Mvc;
using DressForSuccess.API.DTOs;
using System.Text;
using System.Text.Json;

namespace DressForSuccess.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public ChatController(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost]
    public async Task<IActionResult> Chat(ChatMessageDto dto)
    {
        var apiKey = _config["OpenAI:ApiKey"];

        // If no API key, return a smart rule-based response
        if (string.IsNullOrEmpty(apiKey) || apiKey == "your-openai-key-here")
            return Ok(new { reply = GetRuleBasedResponse(dto.Message) });

        var systemPrompt = @"You are a helpful assistant for Dress for Success, a charity that helps people prepare for job interviews by providing professional clothing and support services. 
You help clients navigate the website and services. 
Available services: 
1. Book an appointment for a clothing consultation
2. Browse our clothing store
3. Learn about our referral process
4. Contact information

When a client wants to book, guide them to provide: full name, email, phone number, address, and their referral agency.
Referral agencies: Self Referral, Social Services, Community Center, Employment Agency, Mental Health Organization, Women's Refuge, Homeless Shelter, Food Bank, Government Agency, Church/Religious Org, School/College, Other.
Keep responses concise and friendly.";

        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        foreach (var h in dto.History)
            messages.Add(new { role = h.Role, content = h.Content });

        messages.Add(new { role = "user", content = dto.Message });

        var requestBody = new
        {
            model = "gpt-3.5-turbo",
            messages,
            max_tokens = 300
        };

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        var response = await client.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
            return Ok(new { reply = GetRuleBasedResponse(dto.Message) });

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var reply = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return Ok(new { reply });
    }

    private static string GetRuleBasedResponse(string message)
    {
        var msg = message.ToLower();
        if (msg.Contains("book") || msg.Contains("appointment"))
            return "I'd love to help you book an appointment! Please click the **Book Appointment** button and fill in your details. You'll need your name, email, phone number, address, and referral agency. Would you like me to guide you through it?";
        if (msg.Contains("store") || msg.Contains("shop") || msg.Contains("clothes") || msg.Contains("clothing"))
            return "Our store has a wonderful selection of professional clothing! Click on **Store** in the navigation to browse our available items including blazers, trousers, dresses, and more. Is there a specific type of clothing you're looking for?";
        if (msg.Contains("referral") || msg.Contains("agency"))
            return "We accept referrals from many agencies including Social Services, Community Centres, Employment Agencies, Women's Refuges, Food Banks, and more. You can also self-refer! When booking, you'll select your referral agency from a list. Would you like to book an appointment?";
        if (msg.Contains("volunteer"))
            return "Our wonderful volunteers are the heart of Dress for Success! If you're interested in volunteering, please contact us. If you're an existing volunteer, please use the **Volunteer Login** button at the top of the page.";
        if (msg.Contains("hello") || msg.Contains("hi") || msg.Contains("hey"))
            return "Hello! Welcome to Dress for Success. I'm here to help you navigate our services. We offer professional clothing consultations, a charity store, and support for your job journey. How can I help you today?";
        if (msg.Contains("contact") || msg.Contains("phone") || msg.Contains("email"))
            return "You can reach us through our contact form on the website. Our team will get back to you as soon as possible. Is there something specific you need help with today?";
        if (msg.Contains("cancel"))
            return "If you need to cancel an appointment, please contact us as soon as possible so we can offer the slot to another client. Is there anything else I can help you with?";
        return "Thank you for reaching out! I'm here to help you with booking appointments, browsing our store, or learning about our services. What would you like to do today?";
    }
}

