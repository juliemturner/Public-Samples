import * as React from "react";

export interface ISplashTitleProps {
  title: string;
}

export interface ISplashTitleState {
}

export class SplashTitleState implements ISplashTitleState {
  constructor() { }
}

export default class SplashTitle extends React.PureComponent<ISplashTitleProps, ISplashTitleState> {
  private LOG_SOURCE: string = "🔶SplashTitle";

  constructor(props: ISplashTitleProps) {
    super(props);
    this.state = new SplashTitleState();
  }

  public render(): React.ReactElement<ISplashTitleProps> {
    try {
      return (
        <h1 data-component={this.LOG_SOURCE} className="hoo-splashcard-title">
          {this.props.title}
        </h1>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}