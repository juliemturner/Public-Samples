import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

export interface ISplashDescriptionProps {
  description: string;
}

export interface ISplashDescriptionState {
}

export class SplashDescriptionState implements ISplashDescriptionState {
  constructor() { }
}

export default class SplashDescription extends React.Component<ISplashDescriptionProps, ISplashDescriptionState> {
  private LOG_SOURCE: string = "🔶SplashDescription";

  constructor(props: ISplashDescriptionProps) {
    super(props);
    this.state = new SplashDescriptionState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISplashDescriptionProps>, nextState: Readonly<ISplashDescriptionState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISplashDescriptionProps> {
    try {
      return (
        <p data-component={this.LOG_SOURCE} className="hoo-splashcard-desc">
          {this.props.description}
        </p>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}