using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using PnP.Core.Auth;
using PnP.Core.Services.Builder.Configuration;
using System;
using System.Security.Cryptography.X509Certificates;

[assembly: FunctionsStartup(typeof(LibrarySubscritption.Startup))]

namespace LibrarySubscritption
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddPnPCore(options =>
            {
                // Disable telemetry because of mixed versions on AppInsights dependencies
                options.DisableTelemetry = true;

                // Configure an authentication provider with certificate (Required for app only)
                var authProvider = new X509CertificateAuthenticationProvider(Environment.GetEnvironmentVariable("ClientId"),
                    Environment.GetEnvironmentVariable("TenantId"),
                    LoadCertificate());

                // And set it as default
                options.DefaultAuthenticationProvider = authProvider;

                var siteUrl = $"https://{Environment.GetEnvironmentVariable("Tenant")}.sharepoint.com";
                // Add a default configuration with the site configured in app settings
                options.Sites.Add("Default",
                       new PnPCoreSiteOptions
                       {
                           SiteUrl = siteUrl,
                           AuthenticationProvider = authProvider
                       });

            });
        }

        private static X509Certificate2 LoadCertificate()
        {
            // Will only be populated correctly when running in the Azure Function host
            string certBase64Encoded = Environment.GetEnvironmentVariable("CertificateFromKeyVault");

            if (!string.IsNullOrEmpty(certBase64Encoded))
            {
                // Azure Function flow
                return new X509Certificate2(Convert.FromBase64String(certBase64Encoded),
                                            "",
                                            X509KeyStorageFlags.Exportable |
                                            X509KeyStorageFlags.MachineKeySet |
                                            X509KeyStorageFlags.EphemeralKeySet);
            }
            else
            {
                // Local flow
                var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
                store.Open(OpenFlags.ReadOnly | OpenFlags.OpenExistingOnly);
                var certificateCollection = store.Certificates.Find(X509FindType.FindByThumbprint, Environment.GetEnvironmentVariable("CertificateThumbprint"), false);
                store.Close();

                return certificateCollection[0];
            }
        }
    }
}