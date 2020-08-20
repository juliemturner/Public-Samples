import * as React from 'react';
import styles from './Asyncawait.module.scss';

export interface IAsyncawaitProps {
  type: string;
  time: number;
  start: () => void;
}

export default class Asyncawait extends React.Component<IAsyncawaitProps, {}> {
  public render(): React.ReactElement<IAsyncawaitProps> {
    return (
      <>
        <div className={styles.asyncawait}>
          Async Await Demo: {this.props.type}: {this.props.time.toString()}
        </div>
        <div>
          <button onClick={this.props.start}>Start</button>
        </div>
      </>
    );
  }
}
