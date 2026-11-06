import { app, InvocationContext, SqlChange } from "@azure/functions";
import { IJobStatus } from "../models/models.js";
import { myService } from "../services/myService.js";

export async function sqlTrigger(changes: SqlChange<IJobStatus>[], context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "sqlTrigger";

  try {
    for (const change of changes) {
      const success = myService.ProcessSqlChange(change.Item, change.Operation);

      if (!success) {
        context.log(LOG_SOURCE, `Row change was not processed. Operation: ${change.Operation}`);
      }
    }
  } catch (err) {
    console.error(LOG_SOURCE, "General Failure", err);
    throw err;
  }
}

app.sql('sqlTrigger', {
  tableName: 'dbo.JobStatus',
  connectionStringSetting: 'SqlConnectionString',
  handler: sqlTrigger
});
