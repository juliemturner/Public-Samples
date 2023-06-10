import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";

import { spfi, SPFI, SPFx } from "@pnp/sp";
import { Caching } from "@pnp/queryable";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import { IItemUpdateResult } from "@pnp/sp/items";
import { Web } from "@pnp/sp/webs";

import { IFile, IResponseItem } from "./pnpjsModels";

export interface IPnPjsV3Service {
  ready: boolean;
  Init: (serviceScope: ServiceScope) => void;
  ReadAllFileSize: () => Promise<IFile[]>;
  UpdateTitles: (items: IFile[]) => Promise<IFile[]>;
  GetOtherWebItems: (webUrl: string) => Promise<IFile[]>;
}

export class PnPjsV3Service implements IPnPjsV3Service {
  private LOG_SOURCE = "🔶PnPjsV3Service";
  private LIBRARY_NAME = "Documents";
  public static readonly serviceKey: ServiceKey<IPnPjsV3Service> =
    ServiceKey.create<PnPjsV3Service>("PnPjsV3Service:IPnPjsV3Service", PnPjsV3Service);
  private _ready = false;
  private _pageContext: PageContext;
  private _sp: SPFI;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  public Init(serviceScope: ServiceScope): void {
    serviceScope.whenFinished(() => {
      this._pageContext = serviceScope.consume(PageContext.serviceKey);
      this._sp = spfi().using(SPFx({ pageContext: this._pageContext }));
      this._ready = true;
    });
  }

  public get ready(): boolean {
    return this._ready;
  }

  public async ReadAllFileSize(): Promise<IFile[]> {
    let retVal: IFile[] = [];
    try {
      const spCache = spfi(this._sp).using(Caching({ store: "session" }));

      const response: IResponseItem[] = await spCache.web.lists
        .getByTitle(this.LIBRARY_NAME)
        .items
        .select("Id", "Title", "FileLeafRef", "File/Length")
        .expand("File")();

      retVal = response.map((item: IResponseItem) => {
        return {
          Id: item.Id,
          Title: item.Title || "Unknown",
          Size: item.File?.Length || 0,
          Name: item.FileLeafRef
        };
      });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (ReadAllFileSize) - ${JSON.stringify(err)} - `);
    }
    return retVal;
  }

  public async UpdateTitles(items: IFile[]): Promise<IFile[]> {
    let retVal: IFile[] = [];
    try {
      const [batchedSP, execute] = this._sp.batched();

      const res: IItemUpdateResult[] = [];
      for (let i = 0; i < items.length; i++) {
        batchedSP.web.lists
          .getByTitle(this.LIBRARY_NAME)
          .items
          .getById(items[i].Id)
          .update({ Title: `${items[i].Name}-Updated` })
          .then(r => res.push(r));
      }

      await execute();

      for (let i = 0; i < res.length; i++) {
        const item = await res[i].item.select("Id, Title")<{ Id: number, Title: string }>();
        items[i].Name = item.Title;
      }

      retVal = items;
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (UpdateTitles) - ${JSON.stringify(err)} - `);
    }
    return retVal;
  }

  public async GetOtherWebItems(webUrl: string): Promise<IFile[]>  {
    let retVal: IFile[] = [];
    try {
      //Optionally
      // const webSP = spfi(webUrl).using(SPFx({ pageContext: this._pageContext }));
      // const web = webSP.web;
      const web = Web([this._sp.web, webUrl]);
      if(web){
        const response: IResponseItem[] = await web.lists
        .getByTitle(this.LIBRARY_NAME)
        .items
        .select("Id", "Title", "FileLeafRef", "File/Length")
        .expand("File")();

        retVal = response.map((item: IResponseItem) => {
          return {
            Id: item.Id,
            Title: item.Title || "Unknown",
            Size: item.File?.Length || 0,
            Name: item.FileLeafRef
          };
        });
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (GetOtherWebItems) - ${err}`);
    }
    return retVal;
  }
}

export const pnpv3 = new PnPjsV3Service();