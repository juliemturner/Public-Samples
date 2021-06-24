import * as React from "react";
import isEqual from 'lodash/isEqual';

export interface IMyComponentProps {
  title: string;
}

export interface IMyComponentState {
  total: number;
}

export class MyComponentState implements IMyComponentState {
  constructor(
    public total: number = 0
  ) { }
}

export default class MyComponent extends React.Component<IMyComponentProps, IMyComponentState> {
  private LOG_SOURCE: string = "MyComponent";

  constructor(props) {
    super(props);
    this.state = new MyComponentState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMyComponentProps>, nextState: Readonly<IMyComponentState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  //event: React.MouseEvent<HTMLElement>
  private _onClick = () => {
    const total = 5 * 5;
    this.setState({ total: total });
  }

  public render(): React.ReactElement<IMyComponentProps> {
    try {
      return (
        <div className="demo">
          <h1>{this.props.title}</h1>
          <div>This is Version 3.0 of the web part.</div>
          <div>Current Total: {this.state.total}</div>
          <button onClick={this._onClick}>Update Total</button>
        </div>
      );
    } catch (err) {
      console.info(`${err} - ${this.LOG_SOURCE} (render)`);
      return null;
    }
  }
}