import { IAppInsightUtil, MessageType, SeverityLevel } from "../common/appinsightutil.js";
import { IAuthService } from "../common/auth.js";
import { ChangeType, IChangeModel } from "../models/ChangeModel.js";
import { IMyItem } from "../models/models.js";
import { SubscriptionConfig } from "../models/SubscriptionModels.js";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items/index.js";
import "@pnp/sp/batching.js";
import { IChangeQuery } from "@pnp/sp/index.js";

export interface IMyService {
  readonly ready: boolean;
  Init: () => Promise<void>;
  Process: (subscriptionConfig: SubscriptionConfig) => Promise<SubscriptionConfig>;
}

export class MyService implements IMyService {
  private LOG_SOURCE = "MyService";
  private _ready: boolean = false;

  private _apu: IAppInsightUtil;
  private _auth: IAuthService;

  private _subConfig: SubscriptionConfig;
  private _lastChangeToken: string = null;

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

  public async Process(subscriptionConfig: SubscriptionConfig): Promise<SubscriptionConfig> {
    try {
      this._subConfig = subscriptionConfig;
      // Process the notification
      let processingSuccess = true;
      const changeIds = await this._getChangedItemIds();

      // Process Changes Ids to get items
      if (changeIds.length > 0) {
        let changes: IMyItem[] = [];
        const [batchedSP, execute] = this._auth.sp.batched();
        for (let i = 0; i < changeIds.length; i++) {
          batchedSP.web.lists.getById(process.env.ProjectListId).items.getById(changeIds[i]).select("Id", "Title")().then((item) => {
            if (item != null) {
              this._apu.Log(MessageType.Trace, {
                message: `Change item processing`,
                logSource: this.LOG_SOURCE,
                properties: {
                  method: "Process",
                  itemPayload: JSON.stringify(item)
                },
                severity: SeverityLevel.Verbose
              });
              changes.push(item);
            }
          }, () => {
            this._apu.Log(MessageType.Trace, {
              message: `Item was removed from list`,
              logSource: this.LOG_SOURCE,
              properties: {
                method: "Process"
              },
              severity: SeverityLevel.Verbose
            });
          });
        }
        await execute();

        this._apu.Log(MessageType.Trace, {
          message: `Process Queues`,
          logSource: this.LOG_SOURCE,
          properties: {
            method: "Process",
            changesCount: changes.length
          },
          severity: SeverityLevel.Verbose
        });

        // Process changed items
        if (changes.length > 0) {
          this._apu.Log(MessageType.Trace, {
            message: `Processing change requests`,
            logSource: this.LOG_SOURCE,
            properties: {
              method: "Process",
              changesCount: changes.length
            },
            severity: SeverityLevel.Verbose
          });
          processingSuccess = false;
          let processedCount = 0;
          for (let c = 0; c < changes.length; c++) {
            try {
              /*
              *
              *  DO SOMETHING WITH THE CHANGED ITEM
              *
              */
              processedCount++;
            } catch (err) {
              this._apu.Log(MessageType.Exception, {
                logSource: this.LOG_SOURCE,
                exception: err,
                severity: SeverityLevel.Critical,
                properties: {
                  method: "Process: Change Processing",
                  change: JSON.stringify(changes[c])
                }
              });
            }
          }
          processingSuccess = processedCount === changes.length;
          if (!processingSuccess) {
            this._apu.Log(MessageType.Trace, {
              message: "Processing count was less than changes to process.",
              logSource: this.LOG_SOURCE,
              properties: {
                method: "Process",
                processedCount: processedCount,
                changesCount: changes.length
              },
              severity: SeverityLevel.Verbose
            });
          }
        } else {
          processingSuccess = true;
        }
      } else {
        // If no changes needed to be processed, update the last change token.
        if (this._lastChangeToken == null) { this._lastChangeToken = this._subConfig.lastToken; }
        this._apu.Log(MessageType.Trace, {
          message: `No change items to process.`,
          logSource: this.LOG_SOURCE,
          properties: {
            method: "Process"
          },
          severity: SeverityLevel.Warning
        });
      }
      /* 
      * If processing was successful and LastChangeToken isn't null
      * then update the subscription configuration objects last change token to use next time.
      */
      if (processingSuccess && this._lastChangeToken != null) {
        this._subConfig.lastToken = this._lastChangeToken;
        this._apu.Log(MessageType.Trace, {
          message: `All changes processed successfully. Updating change token to ${this._subConfig.lastToken}.`,
          logSource: this.LOG_SOURCE,
          properties: {
            method: "Process"
          },
          severity: SeverityLevel.Verbose
        });
      } else {
        this._subConfig.lastToken = null;
        this._apu.Log(MessageType.Trace, {
          message: `Failed to process changes.`,
          logSource: this.LOG_SOURCE,
          properties: {
            method: "Process"
          },
          severity: SeverityLevel.Error
        });
      }
    } catch (err) {
      this._subConfig.lastToken = null;
      this._apu.Log(MessageType.Exception, {
        logSource: this.LOG_SOURCE,
        exception: err,
        severity: SeverityLevel.Critical,
        properties: {
          method: "Process"
        }
      });
    }
    // Return the updated subscription configuration to be saved in blob storage.
    return this._subConfig;
  }

  private async _getChangedItemIds(skipIds: boolean = false): Promise<number[]> {
    const retVal: number[] = [];
    try {
      // Process the notification
      const changeQuery: IChangeQuery = {
        Add: true,
        Update: true,
        Item: true,
        ChangeTokenEnd: null,
        ChangeTokenStart: null,
      };

      if (this._subConfig.lastToken != null) {
        changeQuery.ChangeTokenStart = { StringValue: this._subConfig.lastToken };
      }

      // get list changes
      let processingSuccess = true;
      let items: IChangeModel[] = await this._auth.sp.web.lists.getById(process.env.ProjectListId).getChanges(changeQuery);
      do {
        if (items.length > 0) {
          this._apu.Log(MessageType.Trace, {
            logSource: this.LOG_SOURCE,
            message: `Change Items to process: ${items.length}.`,
            severity: SeverityLevel.Verbose
          });
          processingSuccess = false;
          // Process the changes
          // filter add and update changes
          if (!skipIds) {
            items.forEach(o => {
              if (o.ChangeType === ChangeType.Add || o.ChangeType === ChangeType.Update) {
                if (retVal.indexOf(o.ItemId) === -1) {
                  retVal.push(o.ItemId);
                }
              }
            });
          }
          this._lastChangeToken = items[items.length - 1].ChangeToken.StringValue;
          changeQuery.ChangeTokenStart = { StringValue: this._lastChangeToken };
          items = await this._auth.sp.web.lists.getById(process.env.ProjectListId).getChanges(changeQuery);
        }
      } while (items != null && items?.length > 0)
    } catch (err) {
      this._apu.Log(MessageType.Exception, {
        logSource: this.LOG_SOURCE,
        exception: err,
        severity: SeverityLevel.Critical,
        properties: {
          method: "_getChangedItemIds"
        }
      });
    }
    return retVal;
  }
}
