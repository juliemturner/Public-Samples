import { DefaultAzureCredential } from "@azure/identity";
import { AzureIdentity } from "@pnp/azidjsclient";
import { GraphDefault, SPDefault } from "@pnp/nodejs";
import { spfi, SPFI } from "@pnp/sp";
import { graphfi, GraphFI } from '@pnp/graph';
import { IAppInsightUtil, MessageType, SeverityLevel } from "./appinsightutil.js";

export interface IAuthService {
  readonly ready: boolean;
  readonly sp: SPFI;
  readonly graph: GraphFI;
  readonly spAdmin: SPFI;
  Init: () => Promise<boolean>;
}

export class AuthService implements IAuthService {
  private LOG_SOURCE = "AuthService";
  private _ready: boolean = false;
  private _sp: SPFI = null;
  private _graph: GraphFI = null;
  private _spAdmin: SPFI = null;
  private _apu: IAppInsightUtil = null;

  public constructor(apu: IAppInsightUtil) { 
    this._apu = apu;
  }

  public async Init(): Promise<boolean> {
    let retVal = false;
    try {
      const credential = new DefaultAzureCredential();
      // Create SharePoint credentials
      this._sp = spfi(process.env.ProjectSite).using(SPDefault(),
        AzureIdentity(credential, [`https://${process.env.Tenant}.sharepoint.com/.default`], null));
      // Create Graph credentials
      this._graph = graphfi().using(GraphDefault(), AzureIdentity(credential, [`https://graph.microsoft.com/.default`], null));
      // Create SharePoint Admin credentials
      // const tenantUrl = `https://${process.env.Tenant}-admin.sharepoint.com`;
      // this._spAdmin = spfi(tenantUrl).using(SPDefault(),
      // AzureIdentity(credential, [`https://${process.env.Tenant}-admin.sharepoint.com/.default`], null));
      this._ready = true;
      this._apu.Log(MessageType.Trace, {
        message: "Init success",
        logSource: this.LOG_SOURCE,
        properties: {
          method: "Init"
        },
        severity: SeverityLevel.Verbose
      });     
      retVal = true;
    } catch (err) {
      this._apu.Log(MessageType.Exception, {
        logSource: this.LOG_SOURCE,
        exception: err,
        severity: SeverityLevel.Critical,
        properties: {
          method: "Init"
        }
      });
    }
    return retVal;
  }

  public get ready(): boolean {
    return this._ready;
  }
  
  public get sp(): SPFI {
    return this._sp;
  }

  public get graph(): GraphFI {
    return this._graph;
  }

  public get spAdmin(): SPFI {
    return this._spAdmin
  }
}