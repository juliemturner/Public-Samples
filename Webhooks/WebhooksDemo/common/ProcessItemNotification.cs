using System;
using PnP.Core.Services;
using PnP.Core.Model.SharePoint;
using Microsoft.Extensions.Logging;
using PnP.Core.QueryModel;
using PnP.Core;
using Newtonsoft.Json;
using System.Threading;
using PnP.Core.Auth.Services;

namespace LibrarySubscritption
{
    public class ProcessItemNotification
    {
        public readonly string LOG_LOCATION = "ProcessItemNotification";
        private ILogger _log;
        private IPnPContextFactory _pnpContextFactory;
        private CancellationToken _cancellationToken;

        public ProcessItemNotification(ILogger log, IPnPContextFactory pnpContextFactory, CancellationToken cancellationToken)
        {
            _pnpContextFactory = pnpContextFactory;
            _log = log;
            _cancellationToken = cancellationToken;
        }

        public void ProcessNotification(NotificationModel notification)
        {
            try
            {
                var versionSyncDB = new VersionSyncDB(_log);
                var webHook = versionSyncDB.GetListWebhook(new Guid(notification.Resource));
                if (webHook != null)
                {
                    //var certAuthProvider = _pnpAuthProviderFactory.Create("CertAuth");
                    using (var pnpContext = _pnpContextFactory.Create(new Uri(webHook.WebUrl)))
                    {
                        var changeList = pnpContext.Web.Lists.GetById(new Guid(notification.Resource), p => p.Title, p => p.DefaultDisplayFormUrl, p => p.Items, p => p.Fields.QueryProperties(p => p.InternalName,
                                                                                         p => p.FieldTypeKind,
                                                                                         p => p.TypeAsString,
                                                                                         p => p.Title));

                        var changeQueryOpt = new ChangeQueryOptions(false, true);
                        changeQueryOpt.FetchLimit = 1000;
                        changeQueryOpt.Item = true;
                        if (webHook.LastChangeToken.Length > 0)
                        {
                            changeQueryOpt.ChangeTokenStart = new ChangeTokenOptions(webHook.LastChangeToken);
                        }

                        bool allChangesRead = false;
                        do
                        {
                            var changedItems = changeList.GetChanges(changeQueryOpt);
                            _log.LogInformation($"{LOG_LOCATION}-ProcessNotification/Item Update: Changes {changedItems.Count}");
                            if (changedItems.Count > 0)
                            {
                                foreach (var change in changedItems)
                                {
                                    if (_cancellationToken.IsCancellationRequested) { break; }
                                    webHook.LastChangeToken = change.ChangeToken.ToString();

                                    if (change is IChangeItem)
                                    {
                                        if (change.ChangeType == ChangeType.Add || change.ChangeType == ChangeType.Update)
                                        {
                                            var errorInfo = "";
                                            try
                                            {
                                                var item = changeList.Items.GetById((change as IChangeItem).ItemId, p => p.All);
                                                if (item != null)
                                                {
                                                    errorInfo = $"(WebUrl: {webHook.WebUrl}) (List: {changeList.Title}) (ItemId: {item.Id})";

                                                    //DO WHATEVER IT IS YOU NEED TO DO TO THE LIST ITEM
                                                    _log.LogInformation($"{LOG_LOCATION} - Completed processing item {errorInfo}");

                                                }
                                                else
                                                {
                                                    _log.LogWarning($"{LOG_LOCATION}-ProcessNotification/Item Update: (Csom) Could not find item {(change as IChangeItem).ItemId} in list {changeList.Title}: {changeList.DefaultDisplayFormUrl}");
                                                }
                                            }
                                            catch (CsomServiceException cex)
                                            {
                                                if (cex.Error.ToString().Contains("HttpResponseCode: 200") && cex.Error.ToString().Contains("has been modified by"))
                                                {
                                                    _log.LogInformation($"{LOG_LOCATION}-ProcessNotification/Item Update: {errorInfo} (Csom) {cex.Error}");
                                                }
                                                else
                                                {
                                                    _log.LogCritical($"{LOG_LOCATION}-ProcessNotification/Item Update: {errorInfo} (Csom) {cex.Error} - {cex.StackTrace}");
                                                }
                                            }
                                            catch (SharePointRestServiceException spex)
                                            {
                                                _log.LogCritical($"{LOG_LOCATION}-ProcessNotification/Item Update: {errorInfo} (SPRest) {spex.Error} - {spex.StackTrace}");
                                            }
                                            catch (ServiceException srex)
                                            {
                                                _log.LogCritical($"{LOG_LOCATION}-ProcessNotification/Item Update: {errorInfo} (ServExp) {srex.Error.ToString()} - {srex.StackTrace}");
                                            }
                                            catch (Exception ex)
                                            {
                                                _log.LogCritical($"{LOG_LOCATION}-ProcessNotification/Item Update: {errorInfo} {ex.Message} - {ex.StackTrace}");
                                            }
                                        }
                                    }

                                    // Repeat change query in batches of 'FetchLimit' untill we've received all changes
                                    if (changedItems.Count < changeQueryOpt.FetchLimit)
                                    {
                                        allChangesRead = true;
                                    }
                                }
                            }
                            else
                            {
                                allChangesRead = true;
                            }
                            // Are we done?
                        } while (allChangesRead == false && !_cancellationToken.IsCancellationRequested);

                        // Skip validating webhook expiration date update when shutdown is happening.
                        if (notification.ExpirationDateTime.AddDays(-5) < DateTime.Now && !_cancellationToken.IsCancellationRequested)
                        {
                            //Update list webhook with new expiration time.
                            var webhookInstance = changeList.Webhooks.GetById(new Guid(notification.SubscriptionId));
                            webhookInstance.ExpirationDateTime = DateTime.Now.AddMonths(3);
                            webhookInstance.Update();

                            //Update webhook database object
                            webHook.Expiration = DateTime.Now.AddMonths(3);
                        }

                        // Persist the last used changetoken to start from that one when for the next event
                        var success = versionSyncDB.UpsertListWebhooks(webHook);
                    }
                }
            }
            catch (SharePointRestServiceException spex)
            {
                _log.LogCritical($"{LOG_LOCATION}-ProcessNotification (SPEX): NotificationObject {JsonConvert.SerializeObject(notification)}");
                _log.LogCritical($"{LOG_LOCATION}-ProcessNotification (SPEX): {spex.Error} - {spex.StackTrace}");
            }
            catch (Exception ex)
            {
                _log.LogCritical($"{LOG_LOCATION}-ProcessNotification: {ex.Message} - {ex.StackTrace}");
            }
        }
    }
}
