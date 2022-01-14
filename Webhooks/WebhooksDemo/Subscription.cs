using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Queue;

namespace LibrarySubscritption
{
    public static class Subscription
    {
        private static readonly string LOG_LOCATION = "Subscription";

        [FunctionName("Subscription")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            try
            {
                string validationToken = req.Query["validationToken"];

                //If validation for new subscription, respond
                if (validationToken != null)
                {
                    log.LogInformation("Subscription Validation Request.");
                    return new OkObjectResult(validationToken);
                }

                //If notification, process
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<ResponseModel<NotificationModel>>(requestBody);
                var notifications = data.Value;

                log.LogInformation($"Subscription Notification: {notifications.Count}.");
                if (notifications.Count > 0)
                {
                    // Process notifications
                    foreach (var notification in notifications)
                    {
                        // Async add notification to queue for processing
                        CloudStorageAccount storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));

                        // Get queue... create if does not exist.
                        CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
                        CloudQueue queue = queueClient.GetQueueReference(Environment.GetEnvironmentVariable("StorageQueueName"));

                        await queue.AddMessageAsync(new CloudQueueMessage(JsonConvert.SerializeObject(notification)));
                    }
                }

                return new OkResult();
            }
            catch (Exception ex)
            {
                log.LogCritical($"{LOG_LOCATION}-HTTPTrigger: {ex.Message} - {ex.StackTrace}");
                return new BadRequestResult();
            }
        }
    }
}

