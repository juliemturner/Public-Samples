import * as React from 'react';
import { ILink } from '../LinkTiles.models';
export interface ILinkTilesProps {
    tiles: ILink[];
    width: string;
    height: string;
    showTitle: boolean;
}
export interface ILinkTilesState {
}
export declare class LinkTilesState implements ILinkTilesState {
    constructor();
}
export default class LinkTiles extends React.Component<ILinkTilesProps, ILinkTilesState> {
    private LOG_SOURCE;
    constructor(props: any);
    shouldComponentUpdate(nextProps: Readonly<ILinkTilesProps>, nextState: Readonly<ILinkTilesState>): boolean;
    render(): React.ReactElement<ILinkTilesProps>;
}
