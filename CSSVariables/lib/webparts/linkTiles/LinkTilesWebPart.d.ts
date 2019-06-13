import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
export interface ILinkTilesWebPartProps {
    listName: string;
    tileWidth: number;
    tileHeight: number;
    showTitle: boolean;
}
export default class LinkTilesWebPart extends BaseClientSideWebPart<ILinkTilesWebPartProps> {
    onInit(): Promise<void>;
    render(): Promise<void>;
    protected onDispose(): void;
    protected readonly dataVersion: Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
