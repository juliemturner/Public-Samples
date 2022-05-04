import * as React from "react";

//Include CSS in bundle
import './Lib2Styles.css';

export interface ILibItem {
  title: string;
  description: string;
  url: string;
}


export interface IContainerItemProps {
  item: ILibItem;
  key: number;
}

export interface IContainerItemState {
}

export class ContainerItemState implements IContainerItemState {
  constructor() { }
}

export default class ContainerItem extends React.PureComponent<IContainerItemProps, IContainerItemState> {
  private LOG_SOURCE: string = "ContainerItem";

  constructor(props) {
    super(props);
    this.state = new ContainerItemState();
  }

  private onClick = () => {
    window.open(this.props.item.url, "_blank");
  }

  public render(): React.ReactElement<IContainerItemProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="lib2" key={this.props.key}>
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