import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import SplashCard from "./organisms/SplashCard";
import styles from "./AtomicDesign.module.scss";

export interface IAtomicDesignProps {
}

export interface IAtomicDesignState {
}

export class AtomicDesignState implements IAtomicDesignState {
  constructor() { }
}

export default class AtomicDesign extends React.Component<IAtomicDesignProps, IAtomicDesignState> {
  private LOG_SOURCE: string = "🔶AtomicDesign";

  constructor(props: IAtomicDesignProps) {
    super(props);
    this.state = new AtomicDesignState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAtomicDesignProps>, nextState: Readonly<IAtomicDesignState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAtomicDesignProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.atomicDesign}>
          <SplashCard />
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}