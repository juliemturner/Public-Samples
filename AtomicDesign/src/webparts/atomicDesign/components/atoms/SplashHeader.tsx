import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";

export interface ISplashHeaderProps {
}

export interface ISplashHeaderState {
}

export class SplashHeaderState implements ISplashHeaderState {
  constructor() { }
}

export default class SplashHeader extends React.Component<ISplashHeaderProps, ISplashHeaderState> {
  private LOG_SOURCE: string = "🔶SplashHeader";

  constructor(props: ISplashHeaderProps) {
    super(props);
    this.state = new SplashHeaderState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISplashHeaderProps>, nextState: Readonly<ISplashHeaderState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISplashHeaderProps> {
    try {
      return (
        <header data-component={this.LOG_SOURCE} className="hoo-splashcard-header" role="presentation">
          <img src="https://lab.n8d.studio/htwoo/htwoo-core/images/card-images/htwoo-gm-001.svg" className="hoo-splashcard-img" />
        </header>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}