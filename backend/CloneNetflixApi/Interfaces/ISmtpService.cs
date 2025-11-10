using CloneNetflixApi.Helpers;

namespace CloneNetflixApi.Interfaces;

public interface ISmtpService
{
    Task<bool> SendEmailAsync(EmailMessage message);
}