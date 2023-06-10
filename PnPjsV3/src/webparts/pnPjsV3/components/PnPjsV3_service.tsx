import * as React from "react";

import styles from "./PnPjsV3.module.scss";
import { IFile } from "../pnpjsModels";
import { pnpv3 } from "../pnpjsService";

import { PrimaryButton, Label } from "@fluentui/react";

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

  constructor(props: IPnPjsV3Props) {
    super(props);
    this.state = new PnPjsV3State();
  }

  public componentDidMount(): void {
    this._readAllFilesSize();
  }

  private _readAllFilesSize = async (): Promise<void> => {
    try {
      const items = await pnpv3.ReadAllFileSize();
      this.setState({ items });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_readAllFilesSize) - ${JSON.stringify(err)} - `);
    }
  }

  private _updateTitles = async (): Promise<void> => {
    try {
      const items = await pnpv3.UpdateTitles(JSON.parse(JSON.stringify(this.state.items)));
      this.setState({ items });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_updateTitles) - ${JSON.stringify(err)} - `);
    }
  }

  private _getDemoItems = async(): Promise<void> => {
    try {
      const oldItems = this.state.items;
      const url = `${window.location.origin}/sites/Demos`;
      const newItems = await pnpv3.GetOtherWebItems(url);
      const items = oldItems.concat(newItems);
      this.setState({ items });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_getDemoItems) - ${err}`);
    }
  }

  public render(): React.ReactElement<IPnPjsV3Props> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.pnPjsV3}>
          <Label>Welcome to PnP JS Version 3 Demo!</Label>
          <PrimaryButton onClick={this._updateTitles}>Update Item Titles</PrimaryButton>
          <br/><br/>
          <PrimaryButton onClick={this._getDemoItems}>Get Items from Demo Site</PrimaryButton>
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
      console.error(`${this.LOG_SOURCE} (render) - ${JSON.stringify(err)} - `);
      return null;
    }
  }
}