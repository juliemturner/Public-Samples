import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneLabel
} from '@microsoft/sp-property-pane';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './BispfxDashboardWebPart.module.scss';
import * as strings from 'BispfxDashboardWebPartStrings';

import { sp } from '@pnp/sp';
import "@pnp/polyfill-ie11";
import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { IDBService, DBService } from './DashboardService';
require('../../../node_modules/c3/c3.min.css');

export interface IBispfxDashboardWebPartProps {
  refreshInterval: number;
}

export default class BispfxDashboardWebPart extends BaseClientSideWebPart<IBispfxDashboardWebPartProps> {
  private LOG_SOURCE: string = "BispfxDashboardWebPart";
  private dbService: IDBService = null;

  public async onInit(): Promise<void> {
    //Initialize PnPLogger
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;
    //Initialize PnPJs
    sp.setup({
      spfxContext: this.context
    });

    try {
      this.dbService = new DBService("IT Requests");
      await this.dbService.init();

      console.error(`Initialized BISPFx Dashboard Web Part`, LogLevel.Info);
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (render) -- Could not start web part.`);
    }
  }

  public render(): void {
    let refreshText = "";
    if (this.properties.refreshInterval > 0) {
      let newTime = new Date();
      refreshText = `Last Refreshed: ${newTime.getHours()}:${newTime.getMinutes()}:${newTime.getSeconds()}`;
      this.autoRefresh(this.properties.refreshInterval);
    }
    let options = `<option value="All">All</option>`;
    for (let i = 0; i < this.dbService.businessUnits.length; i++) {
      options += `<option value="${this.dbService.businessUnits[i]}">${this.dbService.businessUnits[i]}</option>`;
    }
    this.domElement.innerHTML = `
      <div class="${styles.bispfxDashboard}">
        <div class="${styles.header}">
          <div><select id="buSelector">${options}</select></div>
          <div>
            <span>${refreshText}</span>
            <button id="refreshButton">Refresh</button>
          </div>
        </div>
        <div class="${styles.chartCont}">
          <div class="${styles.chart}">
            <h2 id="RequestsByAssigneeTitle"></h2>
            <div id="RequestsByAssignee"></div>
          </div>
          <div class="${styles.chart}">
            <h2 id="AvgRequestWeekdayTitle"></h2>
            <div id="AvgRequestWeekday"></div>
          </div>
          <div class="${styles.chart}">
            <h2 id="RequestByBusinessUnitTitle"></h2>
            <div id="RequestByBusinessUnit"></div>
          </div>
          <div class="${styles.chart}">
            <h2 id="RequestStatusCountTitle"></h2>
            <div id="RequestStatusCount"></div>
          </div>
        </div>
      </div>`;
    this.dbService.renderData();
    document.getElementById("refreshButton").addEventListener("click", this.refresh);
    document.getElementById("buSelector").addEventListener("change", this.buChanged);
    return;
  }

  private autoRefresh = (interval: number) => {
    window.setInterval(this.refresh, interval * 60000);
  }

  private refresh = async () => {
    await this.dbService.init();
    this.render();
  }

  private buChanged = (event) => {
    this.dbService.selectedBusinessUnit = event.target.value;
    this.dbService.renderData();
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
                PropertyPaneSlider('refreshInterval', {
                  label: strings.DescriptionFieldLabel,
                  max: 5,
                  min: 0,
                  step: 1
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
