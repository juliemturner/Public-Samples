using System;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace LibrarySubscritption
{
    public class ResponseModel<T>
    {
        [JsonProperty(PropertyName = "value")]
        public List<T> Value { get; set; }
    }

    public class NotificationModel
    {
        [JsonProperty(PropertyName = "subscriptionId")]
        public string SubscriptionId { get; set; }

        [JsonProperty(PropertyName = "clientState")]
        public string ClientState { get; set; }

        [JsonProperty(PropertyName = "expirationDateTime")]
        public DateTime ExpirationDateTime { get; set; }

        [JsonProperty(PropertyName = "resource")]
        public string Resource { get; set; }

        [JsonProperty(PropertyName = "tenantId")]
        public string TenantId { get; set; }

        [JsonProperty(PropertyName = "siteUrl")]
        public string SiteUrl { get; set; }

        [JsonProperty(PropertyName = "webId")]
        public string WebId { get; set; }
    }

    public class ListWebHook
    {
        public Guid Id { get; set; }
        public Guid ListId { get; set; }
        public DateTime? Expiration { get; set; }
        public string LastChangeToken { get; set; }
        public string WebUrl { get; set; }
    }
}
