import * as React from "react";
import SplashCard from "./organisms/SplashCard";
import styles from "./AtomicDesign.module.scss";

export interface IAtomicDesignProps {
}

export interface IAtomicDesignState {
}

export class AtomicDesignState implements IAtomicDesignState {
  constructor() { }
}

export default class AtomicDesign extends React.PureComponent<IAtomicDesignProps, IAtomicDesignState> {
  private LOG_SOURCE: string = "🔶AtomicDesign";

  constructor(props: IAtomicDesignProps) {
    super(props);
    this.state = new AtomicDesignState();
  }

  public render(): React.ReactElement<IAtomicDesignProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.atomicDesign}>
          <SplashCard />
        </div>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}