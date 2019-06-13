import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import * as lodash from "lodash";

import styles from './LinkTiles.module.scss';

import { ILink } from "../LinkTiles.models";

export interface ITileProps {
  tile: ILink;
  showTitle: boolean;
}

export interface ITileState {
}

export class TileState implements ITileState {
  constructor() { }
}

export default class Tile extends React.Component<ITileProps, ITileState> {
  private LOG_SOURCE: string = "Tile";

  constructor(props) {
    super(props);
    this.state = new TileState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITileProps>, nextState: Readonly<ITileState>) {
    if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private clickTile = () => {
    //Open link in new blank tab
    window.open(this.props.tile.LinkLocation.Url, "_blank");
  }

  public render(): React.ReactElement<ITileProps> {
    try {
      //Render a tile with front and back
      return (
        <div className={styles.tile} onClick={this.clickTile}>
          <div className={styles.tileFlip}>
            <div className={styles.tileFront}>
              <img
                src={this.props.tile.BackgroundImageLocation.Url} />
              {this.props.showTitle &&
                <div className={styles.tileTitle}>{this.props.tile.Title}</div>
              }
            </div>
            <div className={styles.tileBack}>
              <div className={styles.tileDescription}>{this.props.tile.Description}</div>
            </div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}