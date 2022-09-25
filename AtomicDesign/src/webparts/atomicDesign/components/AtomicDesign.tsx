import * as React from "react";

import HOOTeamsSplashCard from "@n8d/htwoo-react/HOOTeamsSplashCard";
import HOOSplashCardHeader from "@n8d/htwoo-react/HOOSplashCardHeader";
import HOOSplashCardTitle from "@n8d/htwoo-react/HOOSplashCardTitle";
import HOOSplashCardDesc from "@n8d/htwoo-react/HOOSplashCardDesc";
import HOOSplashCardFooter from "@n8d/htwoo-react/HOOSplashCardFooter";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";

import styles from "./AtomicDesign.module.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAtomicDesignProps {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAtomicDesignState {
}

export class AtomicDesignState implements IAtomicDesignState {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }
}

export default class AtomicDesign extends React.PureComponent<IAtomicDesignProps, IAtomicDesignState> {
  private LOG_SOURCE = "🔶AtomicDesign";

  constructor(props: IAtomicDesignProps) {
    super(props);
    this.state = new AtomicDesignState();
  }

  public render(): React.ReactElement<IAtomicDesignProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={styles.atomicDesign}>
          <HOOTeamsSplashCard>
            <HOOSplashCardHeader
              imageAlt="Kitten"
              imageSource="https://placekitten.com/320/180"
            />
            <HOOSplashCardTitle title="My Teams Splash Card" />
            <HOOSplashCardDesc description="My Teams Splash Card Description" />
            <HOOSplashCardFooter>
              <HOOButton
                label="Create Something"
                onClick={() => alert("I Created Something")}
                type={HOOButtonType.Primary}
              />
              <HOOButton
                label="Call to Action"
                onClick={() => alert("This is a call to action!")}
                type={HOOButtonType.Standard}
              />
            </HOOSplashCardFooter>
          </HOOTeamsSplashCard>
        </div>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}