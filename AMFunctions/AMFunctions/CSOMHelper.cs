using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.SharePoint.Client;

namespace AMFunctions
{
    public static class CSOMHelper
    {
        private static readonly string ClientId = Environment.GetEnvironmentVariable("ClientId");
        private static readonly string Cert = Environment.GetEnvironmentVariable("Cert");
        private static readonly string CertPassword = Environment.GetEnvironmentVariable("Cert");
        private static readonly string Authority = Environment.GetEnvironmentVariable("Authority");
        private static readonly string Resource = Environment.GetEnvironmentVariable("Resource");
        private static readonly string Home = Environment.GetEnvironmentVariable("HOME");

        public async static Task<ClientContext> GetClientContext(string siteUrl)
        {
            var authenticationContext = new AuthenticationContext(Authority, false);

            var certPath = Path.Combine(Home, "site\\wwwroot\\", Cert);
            var cert = new X509Certificate2(System.IO.File.ReadAllBytes(certPath),
                CertPassword,
                X509KeyStorageFlags.Exportable |
                X509KeyStorageFlags.MachineKeySet |
                X509KeyStorageFlags.PersistKeySet);

            var authenticationResult = await authenticationContext.AcquireTokenAsync(Resource, new ClientAssertionCertificate(ClientId, cert));
            var token = authenticationResult.AccessToken;

            var ctx = new ClientContext(siteUrl);
            ctx.ExecutingWebRequest += (s, e) =>
            {
                e.WebRequestExecutor.RequestHeaders["Authorization"] = "Bearer " + token;
            };

            return ctx;
        }
    }
}
