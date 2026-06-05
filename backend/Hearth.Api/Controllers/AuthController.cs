using Hearth.Api.Data;
using Hearth.Api.DTOs;
using Hearth.Api.Models;
using Hearth.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hearth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        JwtService jwtService,
        IEmailService emailService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var email = registerDto.Email.Trim().ToLower();
        var emailExists = await _context.Users.AnyAsync(user => user.Email == email);

        if (emailExists)
        {
            return BadRequest("Email is already registered.");
        }

        var user = new User
        {
            FullName = registerDto.FullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var notification = new Notification
        {
            UserId = user.Id,
            Title = "Welcome to Hearth",
            Message = "Your account has been created successfully.",
            Type = "Registration",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        try
        {
            await _emailService.SendEmailAsync(
                user.Email,
                "Welcome to Hearth",
                "Thank you for creating your Hearth account.");
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to send welcome email to {Email}", user.Email);
            Console.WriteLine(exception.ToString());
        }

        return Ok("Registration successful.");
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        var email = loginDto.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(user => user.Email == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        var token = _jwtService.GenerateToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName
        };

        return Ok(response);
    }
}
