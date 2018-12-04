using System;
using System.Globalization;
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

namespace SympFunctionsAM
{
    public static class AMTaskUpdate
    {
        [FunctionName("AMTaskUpdate")]
        public static async Task<HttpResponseMessage> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)]HttpRequestMessage req, TraceWriter log, ExecutionContext context)
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
                        // Get request body
                        string dataString = await req.Content.ReadAsStringAsync();
                        log.Info($"AMTaskUpdate (Run) error at: {DateTime.Now} - {dataString}");
                        dynamic data = await req.Content.ReadAsAsync<AMUpdate>();
                        log.Info($"AMTaskUpdate (Run) error at: {DateTime.Now} - {data?.percentComplete}");
                        double? percentComplete = data?.percentComplete;
                        log.Info($"AMTaskUpdate (Run) error at: {DateTime.Now} - {data?.dueDate}");
                        DateTime? dueDate = data?.dueDate;

                        log.Info(
                            $"AMTaskUpdate (Run) error at: {DateTime.Now} - Values: {dueDate} : {percentComplete}");

                        percentComplete = percentComplete / 100;
                        string siteUrl = Environment.GetEnvironmentVariable("AMSPSiteUrl");

                        var task = Task.Run(async () => await CSOMHelper.GetClientContext(siteUrl, context.FunctionAppDirectory, log));
                        task.Wait();
                        if (task.Result != null)
                        {
                            string ID = "";
                            string title = "";
                            string dueDateString = "";
                            string percentCompleteString = "";
                            string description = "";
                            string itemUrl = "";

                            using (var ctx = task.Result)
                            {
                                List l = ctx.Web.Lists.GetByTitle("AMTaskList");
                                ListItem item = l.GetItemById(taskId);
                                if (percentComplete.HasValue)
                                    item["PercentComplete"] = percentComplete;
                                if (dueDate.HasValue)
                                    item["DueDate"] = dueDate;
                                item.Update();
                                ctx.Load(item);
                                ctx.ExecuteQuery();
                                ID = item["ID"].ToString();
                                title = item["Title"].ToString();
                                dueDateString = ((DateTime) item["DueDate"]).ToString("yyyy-MM-dd");
                                //string dueDate = ((DateTime) item["DueDate"]).ToString("MM/dd/YYYY");
                                percentCompleteString = (((double)item["PercentComplete"]) * 100).ToString(CultureInfo.InvariantCulture);
                                //string percentComplete = (((double)item["PercentComplete"]) * 100) + " %";
                                description = item["Body"]?.ToString() ?? "";
                                itemUrl = Environment.GetEnvironmentVariable("AMSPListDisplayForm") + item["ID"];
                                
                            }
                            string afUrl = "https://" + Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME");
                            string afCompleteKey = Environment.GetEnvironmentVariable("AMCompleteKey");
                            string afCompleteUrl = afUrl + "/api/AMTaskComplete?code=" + afCompleteKey + "&taskId=" + ID;
                            string filePath = Path.Combine(context.FunctionAppDirectory, "AMCardUpdated.json");
                            string originator = Environment.GetEnvironmentVariable("AMOriginator");
                            string jsonAM = System.IO.File.ReadAllText(filePath);

                            var itemPost = string.Format(jsonAM, title, dueDateString, percentCompleteString, description, afCompleteUrl, itemUrl, originator);

                            var response = req.CreateResponse(responseCode);
                            response.Headers.Add("CARD-ACTION-STATUS",
                                "The tasks status has been updated.");
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
                    log.Info($"AMTaskUpdate (Run) error at: {DateTime.Now} - {ex.Message} - {ex.StackTrace}");
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

        public class AMUpdate
        {
            public double? percentComplete { get; set; }
            public DateTime? dueDate { get; set; }
        }
    }
}
