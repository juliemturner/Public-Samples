import * as React from "react";
import * as lodash from "lodash";

export interface IMyComponentProps {
  title: string;
}

export interface IMyComponentState {
}

export class MyComponentState implements IMyComponentState {
  constructor() { }
}

export default class MyComponent extends React.Component<IMyComponentProps, IMyComponentState> {
  private LOG_SOURCE: string = "MyComponent";

  constructor(props) {
    super(props);
    this.state = new MyComponentState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMyComponentProps>, nextState: Readonly<IMyComponentState>) {
    if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IMyComponentProps> {
    try {
      return (
        <div className="demo">
          <h1>{this.props.title}</h1>
          <div>This is Version 1.0 of the web part.</div>
        </div>
      );
    } catch (err) {
      console.info(`${err} - ${this.LOG_SOURCE} (render)`);
      return null;
    }
  }
}