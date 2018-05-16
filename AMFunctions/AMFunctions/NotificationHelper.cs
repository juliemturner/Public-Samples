using System;
using System.Net.Mail;
using System.Security;
using Microsoft.Azure.WebJobs.Host;

namespace AMFunctions
{
    interface INotificationHelper
    {
        bool SendNotification(string notifyEmail, string body);
    }
    class NotificationHelper : INotificationHelper
    {
        private readonly string _username;
        private readonly SecureString _password;
        private readonly TraceWriter _log;
        public NotificationHelper(TraceWriter log)
        {
            _log = log;
            _username = Environment.GetEnvironmentVariable("un");
            var password = Environment.GetEnvironmentVariable("up") == null?"": Environment.GetEnvironmentVariable("up");
            _password = new SecureString();
            if (password == null) return;
            foreach (char c in password)
            {
                _password.AppendChar(c);
            }
        }

        public bool SendNotification(string notifyEmail, string body)
        {
            var retVal = false;
            try
            {
                //Older style cards
                //var emailHeader = "<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'><script type='application/ld+json'>";
                //New Adaptive Cards
                var emailHeader = "<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'><script type='application/adaptivecard+json'>";
                var emailFooter =
                    "</script></head><body>Visit the <a href='https://docs.microsoft.com/en-us/outlook/actionable-messages'>Outlook Dev Portal</a> to learn more about Actionable Messages.</body></html>";

                MailMessage msg = new MailMessage();
                msg.To.Add(new MailAddress(notifyEmail));
                msg.From = new MailAddress(_username);
                msg.Subject = "Task Overdue Notice";
                msg.Body = emailHeader + body + emailFooter;
                msg.IsBodyHtml = true;
                SmtpClient client = new SmtpClient
                {
                    Host = "smtp.office365.com",
                    Credentials = new System.Net.NetworkCredential(_username, _password),
                    Port = 587,
                    EnableSsl = true
                };
                client.Send(msg);
                retVal = true;
            }
            catch (Exception ex)
            {
                _log.Info($"SendAM/NotificationHelper (Run) at: {DateTime.Now} - {ex.Message} - {ex.StackTrace}");
            }
            return retVal;
        }
    }
}
