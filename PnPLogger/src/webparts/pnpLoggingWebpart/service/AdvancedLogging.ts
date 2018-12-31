import { LogLevel, LogListener, LogEntry } from "@pnp/logging";
import { Web } from "@pnp/sp";

export interface ILogData {
  FileName: string;
  MethodName: string;
  StackTrace: string;
}

export class LogData implements ILogData {
  constructor(
    public FileName: string = "",
    public MethodName: string = "",
    public StackTrace: string = ""
  ) { }
}

export interface ILogItem {
  ApplicationName: string;
  CodeFileName: string;
  MethodName: string;
  LoggedOn: Date;
  LoggedById: number;
  ErrorMessage: string;
  StackTrace: string;
}

export class LogItem implements ILogItem {
  constructor(
    public ApplicationName: string = "",
    public CodeFileName: string = "",
    public MethodName: string = "",
    public LoggedOn: Date = new Date(),
    public LoggedById: number = 0,
    public ErrorMessage: string = "",
    public StackTrace: string = ""
  ) { }
}

export default class AdvancedLoggingService implements LogListener {
  private _applicationName: string;
  private _web: Web;
  private _logListName: string;
  private _userId: number;
  private _writeLogFailed: boolean;

  constructor(applicationName: string, logWebUrl: string, logListName: string, currentUser: string) {
    //Initialize
    try {
      this._writeLogFailed = false;
      this._applicationName = applicationName;
      this._logListName = logListName;
      this._web = new Web(logWebUrl);
      this.init(currentUser);
    } catch (err) {
      console.error(`Error initializing AdvancedLoggingService - ${err}`);
    }
  }

  private async init(currentUser: string): Promise<void> {
    //Implement an asyncronous call to ensure the user is part of the web where the ApplicationLog list is and get their user id.
    try {
      let userResult = await this._web.ensureUser(`i:0#.f|membership|${currentUser}`);
      this._userId = userResult.data.Id;
    } catch (err) {
      console.error(`Error initializing AdvancedLoggingService (init) - ${err}`);
    }
  }

  public log(entry: LogEntry): void {
    try {
      //If the entry is an error then log it to my Application Log table.  All other logging is handled by the console listener
      if (entry.level == LogLevel.Error) {
        if (!this._writeLogFailed) {
          let stackArray = null;
          if (entry.data.StackTrace && entry.data.StackTrace.length > 0)
            stackArray = JSON.stringify(entry.data.StackTrace.split('\n').map((line) => { return line.trim(); }));
          let newLogItem: LogItem = new LogItem(this._applicationName, entry.data.FileName, entry.data.MethodName, new Date(), this._userId, entry.message, stackArray);
          let newLogItemResult = this._web.lists.getByTitle(this._logListName).items.add(newLogItem);
        }
      }
    } catch (err) {
      //Assume writing to SharePoint list failed and stop continuous writing
      this._writeLogFailed = true;
      console.error(`Error logging error to SharePoint list ${this._logListName} - ${err}`);
    }
    return;
  }

}