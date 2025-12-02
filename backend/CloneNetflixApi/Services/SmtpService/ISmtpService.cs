using CloneNetflixApi.Helpers.EmailHelpers;

namespace CloneNetflixApi.Services.SmtpService
{
    public interface ISmtpService
    {
        Task<bool> SendEmailAsync(EmailMessage message);
    }
}

