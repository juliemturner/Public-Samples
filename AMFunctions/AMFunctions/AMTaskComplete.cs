using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.SharePoint.Client;

namespace AMFunctions
{
    public static class AMTaskComplete
    {
        [FunctionName("AMTaskComplete")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log)
        {
            HttpStatusCode responseCode = HttpStatusCode.OK;
            string status = "Unknown Error";

            // parse query parameter
            string taskId = req.GetQueryNameValuePairs()
                .FirstOrDefault(q => String.Compare(q.Key, "taskId", StringComparison.OrdinalIgnoreCase) == 0)
                .Value;

            if (taskId != null)
            {
                try
                {
                    SecurityHelper security = new SecurityHelper();
                    responseCode = security.validateSecurity(req, log);
                    if (responseCode == HttpStatusCode.OK)
                    {
                        string siteUrl = Environment.GetEnvironmentVariable("SharePointSiteUrl");

                        var task = Task.Run(async () => await CSOMHelper.GetClientContext(siteUrl));
                        task.Wait();
                        if (task.Result != null)
                        {
                            string title;
                            string itemUrl;
                            using (var ctx = task.Result)
                            {
                                List l = ctx.Web.Lists.GetByTitle("AMTaskList");
                                ListItem item = l.GetItemById(taskId);
                                //send email
                                item["PercentComplete"] = 1;
                                item.Update();
                                ctx.Load(item);
                                ctx.ExecuteQuery();
                                title = item["Title"].ToString();
                                itemUrl = Environment.GetEnvironmentVariable("SharePointListDisplayForm") + item["ID"];
                            }
                            string filePath = Path.Combine(Environment.GetEnvironmentVariable("Home") ?? throw new InvalidOperationException(), "site\\wwwroot\\", "AMCardComplete.json");
                            //string filePath = "AMCardComplete.json";
                            string jsonAM = System.IO.File.ReadAllText(filePath);
                            var itemPost = string.Format(jsonAM, title, itemUrl);
                            var response = req.CreateResponse(responseCode);
                            response.Headers.Add("CARD-ACTION-STATUS",
                                "The task has been marked complete.");
                            response.Headers.Add("CARD-UPDATE-IN-BODY", "true");
                            var content = new StringContent(itemPost, Encoding.UTF8, "application/json");
                            response.Content = content;
                            return response;
                        }
                    }
                }
                catch (Exception ex)
                {
                    responseCode = HttpStatusCode.InternalServerError;
                    status = ex.Message;
                    log.Info($"AMTaskComplete (Run) error at: {DateTime.Now} - {ex.Message} - {ex.StackTrace}");
                }
            }

            // You should also return the CARD-ACTION-STATUS header in the response.
            // The value of the header will be displayed to the user.

            switch (responseCode)
            {
                case HttpStatusCode.Forbidden:
                    status = "This message was not sent through secure channels.";
                    break;
                case HttpStatusCode.Unauthorized:
                    status = "Thie messages token was not valid.";
                    break;
            }

            HttpResponseMessage errorResponse = req.CreateErrorResponse(responseCode, new HttpError());
            errorResponse.Headers.Add("CARD-ACTION-STATUS", status);
            return errorResponse;
        }
    }
}
