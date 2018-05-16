using System;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.O365.ActionableMessages.Authentication;

namespace AMFunctions
{
    public class SecurityHelper
    {
        private static readonly string ServiceBase = Environment.GetEnvironmentVariable("ServiceBase");

        public HttpStatusCode validateSecurity(HttpRequestMessage request, TraceWriter log)
        {
            log.Info($"Started Token Validation");
            // Validate that we have a bearer token.
            if (request.Headers.Authorization == null ||
                !string.Equals(request.Headers.Authorization.Scheme, "bearer", StringComparison.OrdinalIgnoreCase) ||
                string.IsNullOrEmpty(request.Headers.Authorization.Parameter))
            {
                //return request.CreateErrorResponse(HttpStatusCode.Unauthorized, new HttpError());
                return HttpStatusCode.Unauthorized;
            }
        
            // Get the token from the Authorization header 
            string bearerToken = request.Headers.Authorization.Parameter;
            ActionableMessageTokenValidator validator = new ActionableMessageTokenValidator();
            // This will validate that the token has been issued by Microsoft for the
            // specified target URL i.e. the target matches the intended audience (“aud” claim in token)
            // 
            // In your code, replace https://api.contoso.com with your service’s base URL.
            // For example, if the service target URL is https://api.xyz.com/finance/expense?id=1234,
            // then replace https://api.contoso.com with https://api.xyz.com

            var task = Task.Run(async () => await validator.ValidateTokenAsync(bearerToken, ServiceBase));
            task.Wait();
            if (task.Result != null)
            {
                ActionableMessageTokenValidationResult result = task.Result;

                if (!result.ValidationSucceeded)
                {
                    if (result.Exception != null)
                    {
                        Trace.TraceError(result.Exception.ToString());
                    }

                    //return request.CreateErrorResponse(HttpStatusCode.Unauthorized, new HttpError());
                    return HttpStatusCode.Unauthorized;
                }


                // We have a valid token. We will now verify that the sender and action performer are who
                // we expect. The sender is the identity of the entity that initially sent the Actionable 
                // Message, and the action performer is the identity of the user who actually 
                // took the action (“sub” claim in token). 
                // 
                // You should replace the code below with your own validation logic 
                // In this example, we verify that the email is sent by expense@contoso.com (expected sender)
                // and the email of the person who performed the action is john@contoso.com (expected recipient)
                
                var _username = Environment.GetEnvironmentVariable("un");

                if (_username != null && (!string.Equals(result.Sender, _username, StringComparison.OrdinalIgnoreCase) ||
                                          !string.Equals(result.ActionPerformer.Split('@')[1], _username.Split('@')[1], StringComparison.OrdinalIgnoreCase)))
                {
                    return HttpStatusCode.Forbidden;
                }

                return HttpStatusCode.OK;
            }

            return HttpStatusCode.InternalServerError;
        }
    }
}
