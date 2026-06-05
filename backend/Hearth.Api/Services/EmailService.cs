using System.Net;
using System.Net.Mail;
using Hearth.Api.Helpers;
using Microsoft.Extensions.Options;

namespace Hearth.Api.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;

    public EmailService(IOptions<EmailSettings> emailSettings)
    {
        _emailSettings = emailSettings.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        Console.WriteLine($"Attempting to send email to {to}");
        Console.WriteLine($"SMTP host: {_emailSettings.SmtpHost}:{_emailSettings.SmtpPort}");
        Console.WriteLine($"SMTP from: {_emailSettings.FromName} <{_emailSettings.FromEmail}>");

        using var message = new MailMessage
        {
            From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        message.To.Add(to);

        using var smtpClient = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword)
        };

        await smtpClient.SendMailAsync(message);
        Console.WriteLine($"Email sent successfully to {to}");
    }
}
