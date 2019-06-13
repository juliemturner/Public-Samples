import * as React from 'react';
import { Logger, LogLevel } from "@pnp/logging";
import * as lodash from "lodash";
import styles from './LinkTiles.module.scss';
import { ILink } from '../LinkTiles.models';
import Tile from './Tile';

export interface ILinkTilesProps {
  tiles: ILink[];
  width: string;
  height: string;
  showTitle: boolean;
}

export interface ILinkTilesState {
}

export class LinkTilesState implements ILinkTilesState {
  constructor() { }
}

export default class LinkTiles extends React.Component<ILinkTilesProps, ILinkTilesState> {
  private LOG_SOURCE: string = "LinkTiles";

  constructor(props) {
    super(props);
    this.state = new LinkTilesState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILinkTilesProps>, nextState: Readonly<ILinkTilesState>) {
    if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ILinkTilesProps> {
    //Create the CSS Variables based on the web part properties
    let styleBlock = { "--tileWidth": this.props.width + "px", "--tileHeight": this.props.height + "px" } as React.CSSProperties;
    //Render tile container as flex box
    try {
      return (
        <div className={`${styles.linkTiles} ${styles.tileCont}`} style={styleBlock}>
          {this.props.tiles && this.props.tiles.length > 0 && this.props.tiles.map((t: ILink) => {
            return (
              <Tile tile={t} showTitle={this.props.showTitle} />
            );
          })}
        </div>
      );
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (render)`, LogLevel.Error);
      return null;
    }
  }
}
