import { app, InvocationContext, Timer } from "@azure/functions";
import { AppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";
import { AuthService } from "../common/auth.js";
import { MyService } from "../services/myService.js";

export async function timerTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {
  const LOG_SOURCE = "TimerTrigger";
  const _apu = new AppInsightUtil();
  _apu.Init(context.invocationId);

  _apu.Log(MessageType.Event, {
    logSource: `${LOG_SOURCE}`,
    properties: {
      source: LOG_SOURCE,
      message: "Starting notification queue trigger"
    }
  });

  try {
    const timeStamp = new Date().toISOString();
    if (myTimer.isPastDue) {
      _apu.Log(MessageType.Trace, {
        message: `Running Late ${timeStamp}`,
        logSource: LOG_SOURCE,
        properties: {
          source: LOG_SOURCE
        },
        severity: SeverityLevel.Verbose
      });
    }

    const auth = new AuthService(_apu);
    const initialized = await auth.Init();
    let result = false;
    if (initialized) {
      const myService = new MyService(_apu, auth);
      result = await myService.DoJob();
    }

    _apu.Log(MessageType.Trace, {
      message: `Completed ${timeStamp}: Initialized ${initialized} - Update ${result}`,
      logSource: LOG_SOURCE,
      properties: {
        source: LOG_SOURCE,
        initialized: initialized,
        sendReminders: result
      },
      severity: (result) ? SeverityLevel.Information : SeverityLevel.Critical
    });
  } catch (err) {
    _apu.Log(MessageType.Exception, {
      logSource: LOG_SOURCE,
      exception: err,
      severity: SeverityLevel.Critical
    });
  }
}

app.timer('timerTrigger', {
    schedule: process.env.SCHEDULE,
    runOnStartup: process.env.DEBUG === 'true' ? true : false,
    handler: timerTrigger
});
