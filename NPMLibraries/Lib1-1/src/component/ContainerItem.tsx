import * as React from "react";

import "./Lib2Styles";

export interface ILibItem {
  title: string;
  description: string;
  url: string;
}

export interface IContainerItemProps {
  item: ILibItem;
}

export interface IContainerItemState {
}

export class ContainerItemState implements IContainerItemState {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }
}

export default class ContainerItem extends React.Component<IContainerItemProps, IContainerItemState> {
  private LOG_SOURCE: string = "ContainerItem";

  constructor(props: IContainerItemProps) {
    super(props);
    this.state = new ContainerItemState();
  }

  private onClick = () => {
    window.open(this.props.item.url, "_blank");
  };

  public render(): React.ReactElement<IContainerItemProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="lib2">
          <h2>{this.props.item.title}</h2>
          <div>{this.props.item.description}</div>
          <div className="launch"><button onClick={this.onClick}>Launch</button></div>
        </div>
      );
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (render)`);
      return null;
    }
  }
}