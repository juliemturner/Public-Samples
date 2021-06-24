import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import SplashHeader from "../atoms/SplashHeader";
import SplashDescription from "../atoms/SplashDescription";
import SplashTitle from "../atoms/SplashTitle";
import SplashFooter from "../molecules/SplashFooter";

export interface ISplashCardProps {
}

export interface ISplashCardState {
}

export class SplashCardState implements ISplashCardState {
  constructor() { }
}

export default class SplashCard extends React.Component<ISplashCardProps, ISplashCardState> {
  private LOG_SOURCE: string = "🔶SplashCard";

  constructor(props: ISplashCardProps) {
    super(props);
    this.state = new SplashCardState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISplashCardProps>, nextState: Readonly<ISplashCardState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISplashCardProps> {
    try {
      return (
        <article data-component={this.LOG_SOURCE} className="hoo-splashcard">
          <SplashHeader />
          <SplashTitle title="My Splash Screen" />
          <SplashDescription description="My Splash Screen Description" />
          <SplashFooter />
        </article>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}