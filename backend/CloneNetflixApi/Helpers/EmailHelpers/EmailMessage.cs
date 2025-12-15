namespace CloneNetflixApi.Helpers.EmailHelpers
{
    public class EmailMessage
    {
        // Email subject
        public string Subject { get; set; } = string.Empty;
        // Email body/content
        public string Body { get; set; } = string.Empty;
        // Recipient email address
        public string To { get; set; } = string.Empty;
    }
}
