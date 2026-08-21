import { app, input, InvocationContext, output } from "@azure/functions";

const sqlUpdateToken = input.sql({
  commandText: 'dbo.sproc_UpdateLastToken',
  commandType: 'StoredProcedure',
  parameters: '@LastToken={LastToken}',
  connectionStringSetting: 'SqlConnectionString',
});

const updateSPSiteUrl = input.sql({
  commandText: 'dbo.sproc_UpdateSPSiteUrl',
  commandType: 'StoredProcedure',
  parameters: '@JobFamilyName={Name},@SPSiteUrl={Url}',
  connectionStringSetting: 'SqlConnectionString',
});

// output.sql writes/upserts row(s) directly into a table (merge on the table's primary key),
// unlike input.sql above, which is used here to invoke stored procedures instead.
const jobStatusOutput = output.sql({
  commandText: 'dbo.JobStatus',
  connectionStringSetting: 'SqlConnectionString',
});

export async function sqlUpdateQueue(queueItem: { LastToken: string, Name: string, Url: string; }, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "sqlUpdateQueue";

  try {
    if (queueItem.LastToken?.length > 0) {
      const tokenUpdate = context.extraInputs.get(sqlUpdateToken);
    }
    if (queueItem.Name?.length > 0 && queueItem.Url?.length > 0) {
      const sqlUpdate = context.extraInputs.get(updateSPSiteUrl);
    }

    // Record/refresh a status row for this job family - upserted by dbo.JobStatus's primary key (JobFamilyName)
    context.extraOutputs.set(jobStatusOutput, {
      JobFamilyName: queueItem.Name,
      SPSiteUrl: queueItem.Url,
      LastToken: queueItem.LastToken,
      LastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error(LOG_SOURCE, "General Failure", err);
    throw err;
  }
}

app.storageQueue('sqlUpdateQueue', {
  queueName: process.env.SqlUpdateQueueName,
  connection: 'AzureWebJobsStorage',
  extraInputs: [sqlUpdateToken, updateSPSiteUrl],
  extraOutputs: [jobStatusOutput],
  handler: sqlUpdateQueue
});
