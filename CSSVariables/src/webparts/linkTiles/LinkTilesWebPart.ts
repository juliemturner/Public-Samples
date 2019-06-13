import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneCheckbox
} from '@microsoft/sp-property-pane';
import { sp } from '@pnp/sp';
import { Logger, ConsoleListener, LogLevel } from '@pnp/logging';

import * as strings from 'LinkTilesWebPartStrings';
import LinkTiles from './components/LinkTiles';
import { ILinkTilesProps } from './components/LinkTiles';
import { ILink } from './LinkTiles.models';


export interface ILinkTilesWebPartProps {
  listName: string;
  tileWidth: number;
  tileHeight: number;
  showTitle: boolean;
}

export default class LinkTilesWebPart extends BaseClientSideWebPart<ILinkTilesWebPartProps> {
  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;
    //Initialize PnPJs
    sp.setup({
      spfxContext: this.context
    });
  }

  public async render(): Promise<void> {
    //Using PNPJS get the list of links
    let tiles = await sp.web.lists.getByTitle(this.properties.listName).items
      .select("Title", "Description", "LinkLocation", "BackgroundImageLocation")
      .get<ILink>();
    //Create the ReactElement to render the web part passing in data/properties.
    const element: React.ReactElement<ILinkTilesProps> = React.createElement(
      LinkTiles,
      {
        tiles: tiles,
        width: this.properties.tileWidth,
        height: this.properties.tileHeight,
        showTitle: this.properties.showTitle
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: strings.ListNameDescription
                }),
                PropertyPaneTextField('tileHeight', {
                  label: strings.TileHeightDescription
                }),
                PropertyPaneTextField('tileWidth', {
                  label: strings.TileWidthDescription
                }),
                PropertyPaneCheckbox('showTitle', {
                  text: strings.ShowTitleDescription,
                  checked: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
