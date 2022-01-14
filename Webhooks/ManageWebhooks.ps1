$site = "https://sympjulie.sharepoint.com/sites/Demos"

Connect-PnPOnline -Url $site -UseWebLogin
Add-PnPWebhookSubscription -List WebhookItems -NotificationUrl http://f324-75-144-153-50.ngrok.io/api/Subscription
#Get-PnPWebhookSubscriptions -List WebhookItems
#Remove-PnPWebhookSubscription -Identity AB0F1E31-718A-4C5C-80B4-BD81428A9BEA -List WebhookItems