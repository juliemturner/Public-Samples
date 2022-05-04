import * as React from "react";

export interface ISplashDescriptionProps {
  description: string;
}

export interface ISplashDescriptionState {
}

export class SplashDescriptionState implements ISplashDescriptionState {
  constructor() { }
}

export default class SplashDescription extends React.PureComponent<ISplashDescriptionProps, ISplashDescriptionState> {
  private LOG_SOURCE: string = "🔶SplashDescription";

  constructor(props: ISplashDescriptionProps) {
    super(props);
    this.state = new SplashDescriptionState();
  }

  public render(): React.ReactElement<ISplashDescriptionProps> {
    try {
      return (
        <p data-component={this.LOG_SOURCE} className="hoo-splashcard-desc">
          {this.props.description}
        </p>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}