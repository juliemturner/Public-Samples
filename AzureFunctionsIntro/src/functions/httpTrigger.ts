import { app, HttpRequest, HttpResponseInit, InvocationContext, output } from "@azure/functions";
import { AppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";
import { IMyQueueItem } from "../models/models.js";

const queueOutput = output.storageQueue({
  queueName: process.env.MyQueuePath,
  connection: 'AzureWebJobsStorage',
});

export async function httpRequest(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const LOG_SOURCE = "provisionCompleteHttp";
  const _apu = new AppInsightUtil();
  _apu.Init(context.invocationId);

  _apu.Log(MessageType.Event, {
    logSource: `${LOG_SOURCE}`,
    properties: {
      source: LOG_SOURCE,
      message: "Starting http trigger"
    }
  });

  try {
    var requestBody = await request.json();
    var data: IMyQueueItem = requestBody as IMyQueueItem;
    context.extraOutputs.set(queueOutput, JSON.stringify(data));
    return { status: 200 };
  } catch (err) {
    _apu.Log(MessageType.Exception, {
      logSource: LOG_SOURCE,
      exception: err,
      severity: SeverityLevel.Critical,
      properties: {
        method: "provisionCompleteHttp"
      }
    });
    return { status: 500, body: JSON.stringify({ message: `Critical error - ${err}` }) };
  }
};

app.http('httpRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  extraOutputs: [queueOutput],
  handler: httpRequest,
});

