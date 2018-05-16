using System;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.SharePoint.Client;

namespace AMFunctions
{
    public static class SendAM
    {
        [FunctionName("SendAM")]
        //Every 5 minutes
        //0 */5 * * * *
        //Once a day at 9am
        //0 00 9 * * *
        public static void Run([TimerTrigger("0 00 9 * * *")]TimerInfo myTimer, TraceWriter log)
        {
            log.Info($"C# Timer trigger function executed at: {DateTime.Now}");
            try
            {
                string siteUrl = Environment.GetEnvironmentVariable("SharePointSiteUrl");

                var task = Task.Run(async () => await CSOMHelper.GetClientContext(siteUrl));
                task.Wait();
                if (task.Result != null)
                {
                    using (var ctx = task.Result)
                    {
                        List l = ctx.Web.Lists.GetByTitle("AMTaskList");
                        CamlQuery newQuery = new CamlQuery
                        {
                            ViewXml = "<View><Query><Where><And>" +
                                    "<Lt><FieldRef Name=\"DueDate\"/><Value Type=\"DateTime\"><Today/></Value></Lt>" +
                                      "<Lt><FieldRef Name=\"PercentComplete\" /><Value Type=\"Number\">1.00</Value></Lt>" +
                                      "</And></Where></Query><RowLimit>100</RowLimit></View>"
                        };
                        var items = l.GetItems(newQuery);
                        ctx.Load(items);
                        ctx.ExecuteQuery();

                        if (items.Count > 0)
                        {
                            string filePath = Path.Combine(Environment.GetEnvironmentVariable("Home") ?? throw new InvalidOperationException(), "site\\wwwroot\\", "AMCard.json");
                            //string filePath = "AMCard.json";
                            string jsonAM = System.IO.File.ReadAllText(filePath);

                            if (jsonAM.Length > 0)
                            {
                                var notificationHelper = new NotificationHelper(log);
                                foreach (var item in items)
                                {
                                    var fuv = (FieldUserValue[])item["AssignedTo"];
                                    var user = ctx.Web.EnsureUser(fuv[0].LookupValue);
                                    ctx.Load(user);
                                    ctx.ExecuteQuery();
                                    //send email
                                    string title = item["Title"].ToString();
                                    string dueDate = ((DateTime) item["DueDate"]).ToString("yyyy-MM-dd");
                                    //string dueDate = ((DateTime) item["DueDate"]).ToString("MM/dd/YYYY");
                                    string percentComplete = (((double)item["PercentComplete"]) * 100).ToString(CultureInfo.InvariantCulture);
                                    //string percentComplete = (((double)item["PercentComplete"]) * 100) + " %";
                                    string description = item["Body"]?.ToString() ?? "";
                                    string itemUrl = Environment.GetEnvironmentVariable("SharePointListDisplayForm") + item["ID"];
                                    var itemEmail = string.Format(jsonAM, title, dueDate, percentComplete, description, item["ID"], itemUrl);

                                    var result = notificationHelper.SendNotification(user.Email, itemEmail);
                                    log.Info($"SendAM (Run) notification {result} at: {DateTime.Now} - {user.Email}");
                                }
                            }
                            else
                            {
                                log.Info($"SendAM (Run) error at: {DateTime.Now} - jsonAM.Length 0");
                            }
                        }

                        else
                        {
                            log.Info($"SendAM (Run) at: {DateTime.Now} - items.Count 0");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                log.Info($"SendAM (Run) error at: {DateTime.Now} - {ex.Message} - {ex.StackTrace}");
            }
        }
    }
}
