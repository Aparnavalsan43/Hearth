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
        var recipient = _emailSettings.UseTestEmail
            ? _emailSettings.TestEmail
            : to;

        if (_emailSettings.UseTestEmail)
        {
            Console.WriteLine("Development Mode: Redirecting email");
            Console.WriteLine($"Original recipient: {to}");
            Console.WriteLine($"Actual recipient: {recipient}");
            Console.WriteLine($"Subject: {subject}");
        }

        Console.WriteLine($"Attempting to send email to {recipient}");
        Console.WriteLine($"SMTP host: {_emailSettings.SmtpHost}:{_emailSettings.SmtpPort}");
        Console.WriteLine($"SMTP from: {_emailSettings.FromName} <{_emailSettings.FromEmail}>");

        using var message = new MailMessage
        {
            From = new MailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        message.To.Add(recipient);

        using var smtpClient = new SmtpClient(_emailSettings.SmtpHost, _emailSettings.SmtpPort)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword)
        };

        await smtpClient.SendMailAsync(message);
        Console.WriteLine($"Email sent successfully to {recipient}");
    }
}
