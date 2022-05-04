import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';

import { Logger, ConsoleListener, LogLevel, FunctionListener, LogEntry, LogListener } from "@pnp/logging";
import { sp } from '@pnp/sp';

import * as strings from 'PnpLoggingWebpartWebPartStrings';
import PnpLoggingWebpart, { IPnpLoggingWebpartProps } from './components/PnpLoggingWebpart';
import { HttpClient } from '@microsoft/sp-http';
import AdvancedLoggingService from './service/AdvancedLogging';
import { DEFAULT_VERSION } from '@microsoft/microsoft-graph-client';

export interface IPnpLoggingWebpartWebPartProps {
  applicationName: string;
  logWebUrl: string;
  logListName: string;
  loggingType: string;
}

export default class PnpLoggingWebpartWebPart extends BaseClientSideWebPart<IPnpLoggingWebpartWebPartProps> {
  private _ppLoggingTypes: IPropertyPaneDropdownOption[] = [{ key: "Basic", text: "Basic" }, { key: "Custom", text: "Custom" }, { key: "Advanced", text: "Advanced" }];

  public async onInit(): Promise<void> {
    try {
      //Initialize sp for writing to sp lists.
      sp.setup({
        spfxContext: this.context
      });

      //Set type of logger
      switch (this.properties.loggingType) {
        case "Basic":
          this.basicLogging();
          break;
        case "Custom":
          this.customLogging();
          break;
        case "Advanced":
          this.advancedLogging();
          break;
        default:
          this.basicLogging();
      }

      //Set the active log level
      Logger.activeLogLevel = LogLevel.Verbose;
    } catch (err) {
      console.error(`Error initializing PnpLoggingWebpartWebPart - ${err}`);
    }
  }

  private basicLogging(): void {
    Logger.subscribe(new ConsoleListener());
  }

  private customLogging(): void {
    try {
      let listener = new FunctionListener((entry: LogEntry) => {
        try {
          switch (entry.level) {
            case LogLevel.Verbose:
              console.info(entry.message);
              break;
            case LogLevel.Info:
              console.log(entry.message);
              break;
            case LogLevel.Warning:
              console.warn(entry.message);
              break;
            case LogLevel.Error:
              console.error(entry.message);
              // pass all logging data to an existing framework -- for example a REST endpoint 
              this.context.httpClient.post("<REST Endpoint URL>", HttpClient.configurations.v1, { headers: { Accept: "application/json" }, body: JSON.stringify(entry) });
              break;
          }
        } catch (err) {
          console.error(`Error executing customLogging FunctionListener - ${err}`);
        }
      });

      Logger.subscribe(listener);
    } catch (err) {
      console.error(`Error initializing customLogging - ${err}`);
    }
    return;
  }

  private advancedLogging(): void {
    //Initialize my custom logging service and then subscribe to it as well as a ConsoleListener.
    let advancedLogging = new AdvancedLoggingService(this.properties.applicationName, this.properties.logWebUrl, this.properties.logListName, this.context.pageContext.user.loginName);
    Logger.subscribe(advancedLogging);
    Logger.subscribe(new ConsoleListener());
  }

  public render(): void {
    const element: React.ReactElement<IPnpLoggingWebpartProps> = React.createElement(
      PnpLoggingWebpart,
      {}
    );

    ReactDom.render(element, this.domElement);
    console.error(`Initialized PnPLoggingSample: ${this.context.pageContext.web.absoluteUrl}`, LogLevel.Info);
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
                PropertyPaneTextField('applicationName', {
                  label: "Application Name:"
                }),
                PropertyPaneTextField('logWebUrl', {
                  label: "URL of logging list web:"
                }),
                PropertyPaneTextField('logListName', {
                  label: "Display Name of Log list:"
                }),
                PropertyPaneDropdown('loggingType', {
                  label: "Type of Logging:",
                  options: this._ppLoggingTypes
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
