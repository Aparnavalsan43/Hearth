using Hearth.Api.DTOs;
using Hearth.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hearth.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailController> _logger;

    public EmailController(IEmailService emailService, ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestEmail(TestEmailDto testEmailDto)
    {
        try
        {
            await _emailService.SendEmailAsync(
                testEmailDto.To,
                "Hearth Email Test",
                "This is a test email from Hearth.");

            return Ok("Test email sent successfully.");
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed to send test email to {Email}", testEmailDto.To);
            Console.WriteLine(exception.ToString());

            return StatusCode(500, "Test email failed. Check the backend console logs for details.");
        }
    }
}
