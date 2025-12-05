import AppInsights from 'applicationinsights';

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
  private _uGuid: string = null;
  private _commonProps = null;
  
  public Init(invocationId: string): void {
    this._commonProps = {};
    this._uGuid = this._generateRandomString(10);
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
 * Generates a random alphanumeric string of specified length
 * @param length - Length of the string to generate
 * @returns Random alphanumeric string
 */
  private _generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
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
      // set the operation id to the current invocation id
      AppInsights.defaultClient.context.tags[AppInsights.defaultClient.context.keys.operationId] = `${invocationId}-${this._uGuid.toString()}`;
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

    // setup filter for dependency telemetry to exclude (include everything else)
    this._filterDependencyTelemetry([
      /* exclude dependency calls writing to storage queues */
      //'POST telemetrydepot/event-process-drip',
    ]);

    // set logging levels for severity-based telemetry
    this._setMinimumExceptionLoggingLevel();
    this._setMinimumTraceLoggingLevel();
  }

  /**
   * Setup AppInsights telemetry processor to include only DependencyTelemetry
   *  for the specified targets.
   *
   * @export
   * @param {string[]} namesToExclude Array of dependencies by name, as case sensitive strings, to exclude from DependencyTelemetry tracking.
   */
  private _filterDependencyTelemetry(namesToExclude: string[]): void {
    // add telemetry processor to check all dependencies
    AppInsights.defaultClient.addTelemetryProcessor((envelope: AppInsights.Contracts.EnvelopeTelemetry, context: any): boolean => {
      // by default, include all dependency telemetry...
      let includeTelemetryItem = true;

      // if dependency...
      if (envelope.data && AppInsights.Contracts.TelemetryType.Dependency === AppInsights.Contracts.baseTypeToTelemetryType(envelope.data.baseType as AppInsights.Contracts.TelemetryTypeValues)) {
        const telemetryBaseData = envelope.data.baseData as AppInsights.Contracts.DependencyTelemetry;

        // check if should be filtered in
        //  > include only those whitelisted
        if (namesToExclude.includes(telemetryBaseData?.name)) {
          includeTelemetryItem = false;
        }
      }

      return includeTelemetryItem;
    });
  }

  /**
   * Sets the minimum logging level for TrackException calls with the value defined in the app settings value
   * 'APPINSIGHTS_LOGLEVEL'. The `APPINSIGHTS_LOGLEVEL` app setting should be an integer 0-4. Severity set lower than
   * the app setting value will be filtered out from tracked telemetry.
   *
   * @return {*}  {boolean}
   */
  private _setMinimumExceptionLoggingLevel(): void {
    // add telemetry processor to check all dependencies
    AppInsights.defaultClient.addTelemetryProcessor((envelope: AppInsights.Contracts.EnvelopeTelemetry, context: any): boolean => {
      // default to allowing telemetry
      let includeTelemetryItem = true;

      if (envelope.data && AppInsights.Contracts.TelemetryType.Exception === AppInsights.Contracts.baseTypeToTelemetryType(envelope.data.baseType as AppInsights.Contracts.TelemetryTypeValues)) {
        // get app setting (default to WARNING if not set)
        const minLogLevel = (isNaN(parseInt(process.env.APPINSIGHTS_LOGLEVEL)))
          ? AppInsights.Contracts.SeverityLevel.Warning as number
          : parseInt(process.env.APPINSIGHTS_LOGLEVEL);

        // if severity of telemetry less than the minimum logging level, don't include
        if (envelope.data.baseData?.severityLevel <= minLogLevel) {
          includeTelemetryItem = false;
        }
      }

      return includeTelemetryItem;
    });
  }

  /**
   * Sets the minimum logging level for TrackTrace calls with the value defined in the app settings value
   * 'APPINSIGHTS_LOGLEVEL'. The `APPINSIGHTS_LOGLEVEL` app setting should be an integer 0-4. Severity set lower than
   * the app setting value will be filtered out from tracked telemetry.
   *
   * @return {*}  {boolean}
   */
  private _setMinimumTraceLoggingLevel(): void {
    // add telemetry processor to check all dependencies
    AppInsights.defaultClient.addTelemetryProcessor((envelope: AppInsights.Contracts.EnvelopeTelemetry, context: any): boolean => {
      // default to allowing telemetry
      let includeTelemetryItem = true;

      if (envelope.data && AppInsights.Contracts.TelemetryType.Trace === AppInsights.Contracts.baseTypeToTelemetryType(envelope.data.baseType as AppInsights.Contracts.TelemetryTypeValues)) {
        // get app setting (default to WARNING if not set)
        const minLogLevel = (isNaN(parseInt(process.env.APPINSIGHTS_LOGLEVEL)))
          ? AppInsights.Contracts.SeverityLevel.Warning as number
          : parseInt(process.env.APPINSIGHTS_LOGLEVEL);

        // if severity of telemetry less than the minimum logging level, don't include
        if (envelope.data.baseData?.severityLevel < minLogLevel) {
          includeTelemetryItem = false;
        }
      }

      return includeTelemetryItem;
    });
  }
}