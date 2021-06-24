import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

export interface ISplashTitleProps {
  title: string;
}

export interface ISplashTitleState {
}

export class SplashTitleState implements ISplashTitleState {
  constructor() { }
}

export default class SplashTitle extends React.Component<ISplashTitleProps, ISplashTitleState> {
  private LOG_SOURCE: string = "🔶SplashTitle";

  constructor(props: ISplashTitleProps) {
    super(props);
    this.state = new SplashTitleState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISplashTitleProps>, nextState: Readonly<ISplashTitleState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISplashTitleProps> {
    try {
      return (
        <h1 data-component={this.LOG_SOURCE} className="hoo-splashcard-title">
          {this.props.title}
        </h1>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}