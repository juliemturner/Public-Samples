import AppInsights from 'applicationinsights';
import { getGUID } from "@pnp/core";

export const SeverityLevel = AppInsights.Contracts.SeverityLevel;
export enum MessageType {
  "Event",
  "Exception",
  "Metric",
  "Trace"
}

export interface IAppInsightMessage {
  logSource: string;
  message?: string;
  severity?: AppInsights.Contracts.SeverityLevel;
  properties?: any, 
  name?: string, 
  exception?: Error
}

export interface IAppInsightUtil {
  Init: (invocationId: string) => void;
  AddCommonProperty: (keyName: string, value: string) => void;
  Log: (type: MessageType, msg: IAppInsightMessage) => void;
}

export class AppInsightUtil implements IAppInsightUtil {
  private _uGuid = getGUID();
  private _commonProps = {};

  public Init(invocationId: string): void {
    this._initDefaultConfig(invocationId);
    AppInsights.start();
  }

  public AddCommonProperty(keyName: string, value: string): void {
    this._commonProps[keyName] = value;
    AppInsights.defaultClient.commonProperties = this._commonProps;
  }

  public Log(type: MessageType, msg: IAppInsightMessage): void {
    if (AppInsights.defaultClient != undefined) {
      if (msg.properties == null) { msg.properties = {}; }
      switch (type) {
        case MessageType.Trace:
          AppInsights.defaultClient.trackTrace({ message: msg.message, severity: msg.severity, properties: { source: msg.logSource, ...msg.properties } });
          break;
        case MessageType.Event:
          AppInsights.defaultClient.trackEvent({ name: msg.logSource, properties: msg.properties });
          break;
        case MessageType.Exception:
          AppInsights.defaultClient.trackException({ exception: msg.exception, severity: msg.severity, properties: { source: msg.logSource, ...msg.properties } });
          break;
        case MessageType.Metric:
          AppInsights.defaultClient.trackMetric({ name: msg.logSource, value: +msg.message });
          break;
      }
    }
  }

  /**
 * Setup AppInsights with common settings
 *
 * @export
 */
  private _initDefaultConfig(invocationId: string): void {
    /* check if AppInsights already configured...
     *   > determined if `defaultClient` set & if `app.name` set
     *   > if not, bail on the config (don't double setup)
     */
    if (AppInsights.defaultClient?.commonProperties['app.name']) {
      return;
    }

    // enable stream of of live metrics; set auto dependency correlation   
    AppInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).setSendLiveMetrics(true).setAutoDependencyCorrelation(true);

    // set the current tagged app & version of the function app
    this._commonProps["app.name"] = process.env.APP_NAME;
    AppInsights.defaultClient.commonProperties = this._commonProps;
    AppInsights.defaultClient.context.tags[AppInsights.defaultClient.context.keys.applicationVersion] = process.env.APP_VERSION;

    // set the operation id to the current invocation id
    AppInsights.defaultClient.context.tags[AppInsights.defaultClient.context.keys.operationId] = `${invocationId}-${this._uGuid.toString()}`;

  }
}