using System;
using System.Threading;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using PnP.Core.Auth.Services;
using PnP.Core.Services;

namespace LibrarySubscritption
{
    public class NotificationQueue
    {
        private readonly string LOG_LOCATION = "ProcessNotification";
        private readonly IPnPContextFactory pnpContextFactory;
        private readonly IAuthenticationProviderFactory providerFactory;

        public NotificationQueue(IPnPContextFactory pnpContextFactory)
        {
            this.pnpContextFactory = pnpContextFactory;
        }

        [FunctionName("NotificationQueue")]
        public void Run([QueueTrigger("%StorageQueueName%")] NotificationModel notification, ILogger log, CancellationToken cancellationToken)
        {
            try
            {
                log.LogInformation($"{LOG_LOCATION}: Subscription Id '{notification.SubscriptionId}'.");

                var processLibraryNotification = new ProcessItemNotification(log, this.pnpContextFactory, cancellationToken);
                processLibraryNotification.ProcessNotification(notification);
            }
            catch (Exception ex)
            {
                log.LogCritical($"{LOG_LOCATION}-QueueTrigger: {ex.Message} - {ex.StackTrace}");
            }
        }
    }
}
