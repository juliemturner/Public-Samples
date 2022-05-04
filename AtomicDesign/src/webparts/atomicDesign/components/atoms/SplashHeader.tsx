import * as React from "react";

export interface ISplashHeaderProps {
}

export interface ISplashHeaderState {
}

export class SplashHeaderState implements ISplashHeaderState {
  constructor() { }
}

export default class SplashHeader extends React.PureComponent<ISplashHeaderProps, ISplashHeaderState> {
  private LOG_SOURCE: string = "🔶SplashHeader";

  constructor(props: ISplashHeaderProps) {
    super(props);
    this.state = new SplashHeaderState();
  }

  public render(): React.ReactElement<ISplashHeaderProps> {
    try {
      return (
        <header data-component={this.LOG_SOURCE} className="hoo-splashcard-header" role="presentation">
          <img src="https://lab.n8d.studio/htwoo/htwoo-core/images/card-images/htwoo-gm-001.svg" className="hoo-splashcard-img" />
        </header>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}