import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';

import styles from "./component/CmdDialog.module.scss";
import { ISPFxThemes, SPFxThemes } from '@n8d/htwoo-react/SPFxThemes';
import { symset } from "@n8d/htwoo-react/SymbolSet";
import DialogCont, { IDialogContProps } from "./component/DialogCont";

export interface ICmdDialogCommandSetProperties {}

export default class CmdDialogCommandSet extends BaseListViewCommandSet<ICmdDialogCommandSetProperties> {
  private LOG_SOURCE: string = 'CmdDialogCommandSet';
  private _spfxThemes: ISPFxThemes = new SPFxThemes();
  private _docConfigContId = "MPMDocApprovalConfigCont";
  private _docConfigElement: HTMLDivElement = null;

  public async onInit(): Promise<void> {
    try {
      // Initialize Icons Symbol Set
      await symset.initSymbols();
      this._spfxThemes.initThemeHandler(document.body, undefined, undefined, true);

      const command: Command = this.tryGetCommand('SHOW_DIALOG');
      command.visible = false;

      this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

      console.info(`${this.LOG_SOURCE} (onInit) - Complete`);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onInit) - ${err}`);
    }
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    try {
      switch (event.itemId) {
        case 'SHOW_DIALOG':
          this._openDialog();
          break;
        default:
          throw new Error('Unknown command');
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onExecute) - ${err}`);
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    try {
      const command: Command = this.tryGetCommand('SHOW_DIALOG');
      if (command) {
        // This command should be hidden unless exactly one row is selected.
        command.visible = this.context.listView.selectedRows?.length === 1;
      }
      this.raiseOnChange();
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_onListViewStateChanged) - ${err}`);
    }
  }

  private _openDialog(): void {
    try {
      if (this._docConfigElement == undefined) {

        //create approval container div
        this._docConfigElement = document.createElement("DIV") as HTMLDivElement;
        this._docConfigElement.className = styles.cmdDialogRoot;
        this._docConfigElement.setAttribute("id", this._docConfigContId);
        this._docConfigElement.className = styles.cmdDialogRoot;
        this._docConfigElement.style.position = "relative";
        this._docConfigElement.style.display = "block";

        this._spfxThemes.initThemeHandler(this._docConfigElement, undefined, undefined, true);

        //bind to top placeholder
        document.body.appendChild(this._docConfigElement);
      }

      const props: IDialogContProps = {
        closeForm: this._closeConfigForm
      };
      const dialogCont: React.ReactElement<{}> = React.createElement(DialogCont, props);
      ReactDOM.render(dialogCont, this._docConfigElement);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_openConfigForm) - ${err}`);
    }
  }

  private _closeConfigForm = (): void => {
    if (this._docConfigElement !== undefined) {
      ReactDOM.unmountComponentAtNode(this._docConfigElement);
    }
  }
}
