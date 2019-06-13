import * as React from "react";
import { ILink } from "../LinkTiles.models";
export interface ITileProps {
    tile: ILink;
    showTitle: boolean;
}
export interface ITileState {
}
export declare class TileState implements ITileState {
    constructor();
}
export default class Tile extends React.Component<ITileProps, ITileState> {
    private LOG_SOURCE;
    constructor(props: any);
    shouldComponentUpdate(nextProps: Readonly<ITileProps>, nextState: Readonly<ITileState>): boolean;
    private clickTile;
    render(): React.ReactElement<ITileProps>;
}
