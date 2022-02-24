using Microsoft.Extensions.Logging;
using System;
using System.Data;
using System.Data.SqlClient;

namespace LibrarySubscritption
{
    public class WebhookDB
    {
        public readonly string LOG_LOCATION = "WebhookDB";
        private ILogger _log;

        public WebhookDB(ILogger log)
        {
            _log = log;
        }

        public ListWebHook GetListWebhook(Guid listId)
        {
            using (SqlConnection conn = new SqlConnection(Environment.GetEnvironmentVariable("VersionSyncDBConnectionString")))
            {
                ListWebHook retVal = null;
                try
                {
                    conn.Open();
                    SqlCommand command = new SqlCommand
                    {
                        CommandText = "GetListWebhook",
                        CommandType = CommandType.StoredProcedure,
                        Connection = conn
                    };
                    command.Parameters.AddWithValue("@ListId", listId);
                    SqlDataReader reader = command.ExecuteReader();
                    if (reader.HasRows)
                    {
                        //Assumes one matching record
                        reader.Read();
                        retVal = new ListWebHook();
                        if (!reader.IsDBNull(0))
                            retVal.Id = reader.GetGuid(0);
                        if (!reader.IsDBNull(1))
                            retVal.WebUrl = reader.GetString(1);
                        if (!reader.IsDBNull(2))
                            retVal.ListId = reader.GetGuid(2);
                        if (!reader.IsDBNull(3))
                            retVal.LastChangeToken = reader.GetString(3);
                        if (!reader.IsDBNull(5))
                            retVal.Expiration = reader.GetDateTime(5);
                    }
                }
                catch (Exception ex)
                {
                    _log.LogCritical($"{LOG_LOCATION}-GetListWebhook: {ex.Message} - {ex.StackTrace}");
                }
                finally
                {
                    conn.Close();
                }

                return retVal;
            }
        }

        public Boolean UpsertListWebhooks(ListWebHook listWebHook)
        {
            using (SqlConnection conn = new SqlConnection(Environment.GetEnvironmentVariable("VersionSyncDBConnectionString")))
            {
                Boolean retVal = false;
                try
                {
                    conn.Open();
                    SqlCommand command = new SqlCommand
                    {
                        CommandText = "UpsertListWebhooks",
                        CommandType = CommandType.StoredProcedure,
                        Connection = conn
                    };
                    command.Parameters.AddWithValue("@Id", listWebHook.Id);
                    command.Parameters.AddWithValue("@ListId", listWebHook.ListId);
                    command.Parameters.AddWithValue("@Expiration", listWebHook.Expiration);
                    command.Parameters.AddWithValue("@LastChangeToken", listWebHook.LastChangeToken);
                    command.Parameters.AddWithValue("@WebUrl", listWebHook.WebUrl);
                    command.ExecuteNonQuery();
                    retVal = true;
                }
                catch (Exception ex)
                {
                    _log.LogCritical($"{LOG_LOCATION}-UpsertListWebhooks: {ex.Message} - {ex.StackTrace}");
                }
                finally
                {
                    conn.Close();
                }

                return retVal;
            }
        }

    }
}
