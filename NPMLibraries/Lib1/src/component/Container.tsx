import * as React from "react";

import { ContainerItem, ILibItem } from "@juliemturner/lib1_1";

export interface IContainerProps {
  items: ILibItem[];
}

export interface IContainerState {
}

export class ContainerState implements IContainerState {
  constructor() { }
}

export default class Container extends React.PureComponent<IContainerProps, IContainerState> {
  private LOG_SOURCE = "Container";

  constructor(props) {
    super(props);
    this.state = new ContainerState();
  }

  public render(): React.ReactElement<IContainerProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="lib1">
          {this.props.items && this.props.items.length > 0 && this.props.items.map((i, idx) => {
            return (
              <ContainerItem key={idx} item={i} />
            );
          })}
        </div>
      );
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (render)`);
      return null;
    }
  }
}