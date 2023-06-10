import * as React from "react";

import { Logger, LogLevel } from "@pnp/logging";
import { Caching } from "@pnp/queryable";
import { IItemUpdateResult } from "@pnp/sp/items";

import styles from "./PnPjsV3.module.scss";
import { getSP } from "../pnpjsConfig";
import { spfi, SPFI } from "@pnp/sp";
import { PrimaryButton, Label } from "@fluentui/react";

export interface IFile {
  Id: number;
  Title: string;
  Name: string;
  Size: number;
}

export interface IResponseFile {
  Length: number;
}

export interface IResponseItem {
  Id: number;
  File: IResponseFile;
  FileLeafRef: string;
  Title: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IPnPjsV3Props {
}

export interface IPnPjsV3State {
  items: IFile[];
}

export class PnPjsV3State implements IPnPjsV3State {
  constructor(
    public items: IFile[] = []
  ) { }
}

export default class PnPjsV3 extends React.PureComponent<IPnPjsV3Props, IPnPjsV3State> {
  private LOG_SOURCE = "🔶PnPjsV3";
  private LIBRARY_NAME = "Documents";
  private _sp: SPFI;

  constructor(props: IPnPjsV3Props) {
    super(props);
    this.state = new PnPjsV3State();
    this._sp = getSP();
  }

  public componentDidMount(): void {
    this._readAllFilesSize();
  }

  private _readAllFilesSize = async (): Promise<void> => {
    try {
      const spCache = spfi(this._sp).using(Caching({ store: "session" }));

      const response: IResponseItem[] = await spCache.web.lists
        .getByTitle(this.LIBRARY_NAME)
        .items
        .select("Id", "Title", "FileLeafRef", "File/Length")
        .expand("File")();

      const items: IFile[] = response.map((item: IResponseItem) => {
        return {
          Id: item.Id,
          Title: item.Title || "Unknown",
          Size: item.File?.Length || 0,
          Name: item.FileLeafRef
        };
      });

      this.setState({ items });
    } catch (err) {
      Logger.log({level: LogLevel.Error, message: `${this.LOG_SOURCE} (_readAllFilesSize) - ${JSON.stringify(err)}`});
    }
  }

  private _updateTitles = async (): Promise<void> => {
    try {
      const [batchedSP, execute] = this._sp.batched();

      const items: IFile[] = JSON.parse(JSON.stringify(this.state.items));

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

      this.setState({ items });
    } catch (err) {
      Logger.log({level: LogLevel.Error, message: `${this.LOG_SOURCE} (_updateTitles) - ${JSON.stringify(err)}`});
    }
  }

  public render(): React.ReactElement<IPnPjsV3Props> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.pnPjsV3}>
          <Label>Welcome to PnP JS Version 3 Demo!</Label>
          <PrimaryButton onClick={this._updateTitles}>Update Item Titles</PrimaryButton>
          <Label>List of documents:</Label>
          <table width="100%">
            <tr>
              <td><strong>Title</strong></td>
              <td><strong>Name</strong></td>
              <td><strong>Size (KB)</strong></td>
            </tr>
            {this.state.items && this.state.items.map((item, idx) => {
              return (
                <tr key={idx}>
                  <td>{item.Title}</td>
                  <td>{item.Name}</td>
                  <td>{(item.Size / 1024).toFixed(2)}</td>
                </tr>
              );
            })}
          </table>
        </div>
      );
    } catch (err) {
      Logger.log({level: LogLevel.Error, message: `${this.LOG_SOURCE} (render) - ${JSON.stringify(err)}`});
      return null;
    }
  }
}