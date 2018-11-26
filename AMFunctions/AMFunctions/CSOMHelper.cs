using System;
using System.IO;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.SharePoint.Client;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs.Host;

namespace SympFunctionsAM
{
    public static class CSOMHelper
    {
        private static readonly string ClientId = Environment.GetEnvironmentVariable("ClientIdAM");
        private static readonly string Cert = Environment.GetEnvironmentVariable("Cert");
        private static readonly string CertPassword = Environment.GetEnvironmentVariable("CertPassword");
        private static readonly string Authority = Environment.GetEnvironmentVariable("Authority");
        private static readonly string Resource = Environment.GetEnvironmentVariable("ResourceSharePoint");
        //private static readonly string Home = Environment.GetEnvironmentVariable("Home");

        public async static Task<ClientContext> GetClientContext(string siteUrl, string appDirectory, TraceWriter log)
        {
            try
            {
                var authenticationContext = new AuthenticationContext(Authority, false);

                //var certPath = Path.Combine(Environment.CurrentDirectory, Cert);
                var certPath = Path.Combine(appDirectory, Cert);
                var cert = new X509Certificate2(System.IO.File.ReadAllBytes(certPath),
                    CertPassword,
                    X509KeyStorageFlags.Exportable |
                    X509KeyStorageFlags.MachineKeySet |
                    X509KeyStorageFlags.PersistKeySet);

                var authenticationResult =
                    await authenticationContext.AcquireTokenAsync(Resource,
                        new ClientAssertionCertificate(ClientId, cert));
                var token = authenticationResult.AccessToken;

                var ctx = new ClientContext(siteUrl);
                ctx.ExecutingWebRequest += (s, e) =>
                {
                    e.WebRequestExecutor.RequestHeaders["Authorization"] =
                        "Bearer " + authenticationResult.AccessToken;
                };

                return ctx;
            }
            catch (Exception ex)
            {
                log.Error($"SendAM (Run) error at: {DateTime.Now} - {ex.Message} - {ex.StackTrace}");
            }

            return null;
        }
    }
}
