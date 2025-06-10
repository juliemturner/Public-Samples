import { IAppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil";
import { IAuthService } from "../common/auth";
import { IMyQueueItem } from "../models/models";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface IMyService {
  readonly ready: boolean;
  Init: () => Promise<void>;
  Process: (item: IMyQueueItem) => Promise<boolean>;
  DoJob: () => Promise<boolean>;
}

export class MyService implements IMyService {
  private LOG_SOURCE = "MyService";
  private _ready: boolean = false;

  private _apu: IAppInsightUtil;
  private _auth: IAuthService;

  constructor(apu: IAppInsightUtil, auth: IAuthService) {
    this._apu = apu;
    this._auth = auth;
  }

  public async Init(): Promise<void> {
    this._ready = true;
  }

  public get ready(): boolean {
    return this._ready;
  }

  public async Process(item: IMyQueueItem): Promise<boolean> {
    let retVal = false;
    try{
      // Do something with the queue item.
      this._auth.sp.web.lists.getById(process.env.ProjectListId).items.getById(item.id).update({Title: 'New Title'});
      retVal = true;
    }catch(err){
      this._apu.Log(MessageType.Exception, {
        logSource: this.LOG_SOURCE,
        exception: err,
        severity: SeverityLevel.Critical,
        properties: {
          method: "Process"
        }
      });
    }
    return retVal;
  }

  public async DoJob(): Promise<boolean> {
    let retVal = false;
    try{
      // Do something.
      retVal = true;
    }catch(err){
      this._apu.Log(MessageType.Exception, {
        logSource: this.LOG_SOURCE,
        exception: err,
        severity: SeverityLevel.Critical,
        properties: {
          method: "DoJob"
        }
      });
    }
    return retVal;
  }
}
