import * as React from "react";

export enum BUTTON_TYPE {
  "Primary",
  "Standard"
}

export interface IHooButtonProps {
  type: BUTTON_TYPE;
  label: string;
  disabled: boolean;
  onClick: () => void;
}

export interface IHooButtonState {
}

export class HooButtonState implements IHooButtonState {
  constructor() { }
}

export default class HooButton extends React.PureComponent<IHooButtonProps, IHooButtonState> {
  private LOG_SOURCE: string = "🔶HooButton";

  constructor(props: IHooButtonProps) {
    super(props);
    this.state = new HooButtonState();
  }

  public render(): React.ReactElement<IHooButtonProps> {
    try {
      return (
        <button data-component={this.LOG_SOURCE} className={`hoo-button${(this.props.type === BUTTON_TYPE.Primary) ? "-primary" : ""}`} disabled={this.props.disabled} aria-disabled={this.props.disabled} onClick={this.props.onClick}>
          <div className="hoo-button-label">{this.props.label}</div>
        </button>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}