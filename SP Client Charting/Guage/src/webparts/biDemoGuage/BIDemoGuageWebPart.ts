import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { MSGraphClient } from '@microsoft/sp-http';

import { Logger, ConsoleListener, LogLevel } from '@pnp/logging';
import { sp } from '@pnp/sp';

import * as strings from 'BIDemoGuageWebPartStrings';
import BIDemoGuage from './components/BIDemoGuage';
import { IBIDemoGuageProps } from './components/BIDemoGuage';

export interface IBiDemoGuageWebPartProps {
  description: string;
}

export default class BiDemoGuageWebPart extends BaseClientSideWebPart<IBiDemoGuageWebPartProps> {
  private graphClient: MSGraphClient;

  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;
    //Initialize PnPJs
    sp.setup({
      spfxContext: this.context
    });
    this.graphClient = await this.context.msGraphClientFactory.getClient();
    return;
  }

  public render(): void {
    const element: React.ReactElement<IBIDemoGuageProps> = React.createElement(
      BIDemoGuage, { graphClient: this.graphClient }
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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
