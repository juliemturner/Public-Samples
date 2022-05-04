import * as React from 'react';
import styles from './PnpLoggingWebpart.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import { Logger, LogLevel, LogEntry } from '@pnp/logging';
import { ILogData } from '../service/AdvancedLogging';

export interface IPnpLoggingWebpartProps {
}

export interface IPnpLoggingWebpartState {
  logType: string;
}

export default class PnpLoggingWebpart extends React.PureComponent<IPnpLoggingWebpartProps, IPnpLoggingWebpartState> {

  constructor(props) {
    super(props);
    this.state = { logType: "Info" };
  }
  private changeType = (value: string) => {
    this.setState({ logType: value });
  }

  private logDemo = () => {
    let level = LogLevel.Info;
    switch (this.state.logType) {
      case "Verbose":
        level = LogLevel.Verbose;
        break;
      case "Info":
        level = LogLevel.Info;
        break;
      case "Warning":
        level = LogLevel.Warning;
        break;
      case "Error":
        level = LogLevel.Error;
        break;
      default:
        level = LogLevel.Info;
    }
    //simulating error to get stack trace
    let stack = new Error().stack || "";
    //utilized in advanced logging
    let data: ILogData = { FileName: "PnpLoggingWebpart.tsx", MethodName: "logDemo", StackTrace: stack };
    let logEntry: LogEntry = { message: `Logging information to logger which was already initialized for log level ${this.state.logType}!`, level: level, data: data };
    Logger.log(logEntry);

    //Alternately if not using data payload you can call Logger.Write(<message>, <LogLevel>)
    //console.error(`message`, level);
  }

  public render(): React.ReactElement<IPnpLoggingWebpartProps> {
    return (
      <div className={styles.pnpLoggingWebpart}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>PnP Logging Methods Demo</span>
              <p className={styles.subTitle}>Several examples of how to use PnP Logging in your SPFx projects.</p>
              <p>
                <span className={styles.label}>Select Log Level: </span>
                <select value={this.state.logType} onChange={(element: React.ChangeEvent<HTMLSelectElement>) => { this.changeType(element.currentTarget.value); }}>
                  <option value="Verbose">Verbose</option>
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Error">Error</option>
                </select>
              </p>
              <div className={styles.button} onClick={() => { this.logDemo(); }}>
                <span className={styles.label}>Click for Log Demo</span>
              </div>
              <p>
                <span className={styles.label}>Make sure to open your browser console (F12)</span>
              </p>
            </div>
          </div>
        </div>
      </div >
    );
  }
}
