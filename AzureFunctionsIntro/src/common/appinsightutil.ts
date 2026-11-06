import AppInsights from 'applicationinsights';
import { context as otelContext, trace, SpanStatusCode, TraceFlags } from '@opentelemetry/api';
import { ReadableSpan, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export const SeverityLevel = {
  Verbose: "Verbose",
  Information: "Information",
  Warning: "Warning",
  Error: "Error",
  Critical: "Critical"
} as const;
export type SeverityLevel = (typeof SeverityLevel)[keyof typeof SeverityLevel];

const _severityOrder: Record<string, number> = {
  Verbose: 0, Information: 1, Warning: 2, Error: 3, Critical: 4
};

export enum MessageType {
  "Event",
  "Exception",
  "Metric",
  "Trace"
}
export interface IAppInsightMessage {
  logSource: string;
  message?: string;
  severity?: SeverityLevel;
  properties?: any,
  name?: string,
  exception?: Error
}

export interface IAppInsightUtil {
  Init: (invocationId: string, traceParent: string) => void;
  AddCommonProperty: (keyName: string, value: string) => void;
  Log: (type: MessageType, msg: IAppInsightMessage) => void;
  Flush: () => Promise<void>;
}

// Drops spans for DefaultAzureCredential's expected, handled EnvironmentCredential/
// WorkloadIdentityCredential failures during its chain walk — Azure Monitor's
// auto-instrumentation otherwise reports these as spurious Exception telemetry.
class CredentialChainNoiseFilter implements SpanProcessor {
  private static readonly EXPECTED_UNAVAILABLE = /^(EnvironmentCredential|WorkloadIdentityCredential)\.getToken$/;

  public onStart(): void { }

  public onEnd(span: ReadableSpan): void {
    if (span.status.code === SpanStatusCode.ERROR && CredentialChainNoiseFilter.EXPECTED_UNAVAILABLE.test(span.name)) {
      span.spanContext().traceFlags = TraceFlags.NONE;
    }
  }

  public forceFlush(): Promise<void> { return Promise.resolve(); }
  public shutdown(): Promise<void> { return Promise.resolve(); }
}

export class AppInsightUtil implements IAppInsightUtil {
  // Kept off defaultClient.commonProperties, which is shared across concurrent
  // invocations on the same worker and would leak one invocation's properties into another's.
  private _invocationProps: Record<string, string> = {};
  private _otelContext: ReturnType<typeof otelContext.active> | null = null;
  private _minLogLevel: number = _severityOrder[SeverityLevel.Warning];

  public Init(invocationId: string, traceParent: string): void {
    if (!AppInsights.defaultClient) {
      // AppRoleName/AppVersion (the standard, filterable columns — not customDimensions) are
      // derived by the exporter from the OTel Resource on every span/log record, not from
      // defaultClient.commonProperties/context.tags. Those only ever reach manually-logged
      // trace/event/exception properties, never auto-collected requests/dependencies.
      const config = AppInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
      config
        .setSendLiveMetrics(true)
        .setAzureMonitorOptions({
          resource: resourceFromAttributes({
            [ATTR_SERVICE_NAME]: process.env.APP_NAME,
            [ATTR_SERVICE_VERSION]: process.env.APP_VERSION
          }),
          spanProcessors: [new CredentialChainNoiseFilter()]
        })
        .start();
    }

    this._invocationProps = {
      "invocationId": invocationId
    };

    this._minLogLevel = isNaN(parseInt(process.env.APPINSIGHTS_LOGLEVEL))
      ? _severityOrder[SeverityLevel.Warning]
      : parseInt(process.env.APPINSIGHTS_LOGLEVEL);

    const parts = traceParent?.split('-');
    if (parts?.length >= 4) {
      const spanCtx = {
        traceId: parts[1],
        spanId: parts[2],
        traceFlags: parseInt(parts[3], 16) || TraceFlags.SAMPLED,
        isRemote: true
      };
      this._otelContext = trace.setSpanContext(otelContext.active(), spanCtx);
    }
  }

  public AddCommonProperty(keyName: string, value: string): void {
    this._invocationProps[keyName] = value;
  }

  public Log(type: MessageType, msg: IAppInsightMessage): void {
    if (!AppInsights.defaultClient) return;
    const props = { ...this._invocationProps, ...(msg.properties || {}) };
    const itemLevel = _severityOrder[msg.severity] ?? 0;

    const emit = () => {
      switch (type) {
        case MessageType.Trace:
          if (itemLevel >= this._minLogLevel) {
            AppInsights.defaultClient.trackTrace({ message: msg.message, severity: msg.severity, properties: { source: msg.logSource, ...props } });
          }
          break;
        case MessageType.Event:
          AppInsights.defaultClient.trackEvent({ name: msg.logSource, properties: props });
          break;
        case MessageType.Exception:
          if (itemLevel > this._minLogLevel) {
            AppInsights.defaultClient.trackException({ exception: msg.exception, severity: msg.severity, properties: { source: msg.logSource, ...props } });
          }
          break;
        case MessageType.Metric:
          AppInsights.defaultClient.trackMetric({ name: msg.logSource, value: +msg.message });
          break;
      }
    };

    if (this._otelContext) {
      otelContext.with(this._otelContext, emit);
    } else {
      emit();
    }
  }

  // Batch export runs on its own timer, decoupled from this invocation's promise chain.
  // Timer-triggered functions can have their worker frozen/recycled shortly after the handler
  // resolves, so callers must await this or queued-but-unexported telemetry can be lost.
  public Flush(): Promise<void> {
    if (!AppInsights.defaultClient) return Promise.resolve();
    return AppInsights.defaultClient.flush();
  }
}
