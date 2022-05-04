import * as React from "react";
import HooButton, { BUTTON_TYPE } from "../atoms/HooButton";

export interface ISplashFooterProps {
}

export interface ISplashFooterState {
}

export class SplashFooterState implements ISplashFooterState {
  constructor() { }
}

export default class SplashFooter extends React.PureComponent<ISplashFooterProps, ISplashFooterState> {
  private LOG_SOURCE: string = "🔶SplashFooter";

  constructor(props: ISplashFooterProps) {
    super(props);
    this.state = new SplashFooterState();
  }

  private _createClick = () => {
    try {
      alert("Create Something Was Clicked");
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_createClick) - ${err}`);
    }
  }

  private _callClick = () => {
    try {
      alert("Call for Action Was Clicked");
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_callClick) - ${err}`);
    }
  }

  public render(): React.ReactElement<ISplashFooterProps> {
    try {
      return (
        <footer data-component={this.LOG_SOURCE} className="hoo-splashcard-footer">
          <HooButton type={BUTTON_TYPE.Primary} label="Create Something" disabled={false} onClick={this._createClick} />
          <HooButton type={BUTTON_TYPE.Standard} label="Call for Action" disabled={false} onClick={this._callClick} />
        </footer>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}