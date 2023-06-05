import { BaseApplicationCustomizer, PlaceholderContent, PlaceholderName } from '@microsoft/sp-application-base';
import { override } from '@microsoft/decorators';

import * as ReactDOM from "react-dom";
import { Lib1Launcher, ILib1Launcher, ILib1LauncherProps } from "@juliemturner/lib1";
require('react');
require("@juliemturner/lib1_1");

export interface ISpExtApplicationCustomizerProperties { }

export default class SpExtApplicationCustomizer
  extends BaseApplicationCustomizer<ISpExtApplicationCustomizerProperties> {
  private LOG_SOURCE = "🟢SpExtApplicationCustomizer";
  private _elementId = "SpExtApplicationCustomizer";
  private _topPlaceholder: PlaceholderContent | undefined;

  public async onInit(): Promise<void> {
    try {
      this.context.application.navigatedEvent.add(this, this._render);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onInit) - ${err}`);
    }
  }

  @override
  public async onDispose(): Promise<void> {
    try {
      this.context.application.navigatedEvent.remove(this, this._render);
      // eslint-disable-next-line @microsoft/spfx/pair-react-dom-render-unmount
      ReactDOM.unmountComponentAtNode(this._getTopContainer());
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onDispose) ${err}`);
    }
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      this._topPlaceholder.domElement.innerHTML = "";
    }
  }

  private _getTopContainer(): HTMLElement {
    return document.getElementById(this._elementId);
  }

  private async _render(): Promise<void> {
    try {
      if (!this._topPlaceholder) {
        this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Top,
          { onDispose: this.onDispose }
        );
      }

      //if a placeholder was retrieved, then we can work with that
      if (this._topPlaceholder != undefined) {
        //get the nav container we want that would be inside of the SPFx placeholder
        let container = this._getTopContainer();

        //if the container was not found, go and create, then append to spfx top placeholder
        if (container == undefined) {
          //create nav div
          container = document.createElement("DIV");
          container.setAttribute("id", this._elementId);
          //bind to top placeholder
          this._topPlaceholder.domElement.appendChild(container);
        }

        //Set up header launcher
        const items = [
          { title: "Test Item 1", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" },
          { title: "Test Item 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" },
          { title: "Test Item 3", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" },
          { title: "Test Item 4", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" }
        ];

        const lib1Launcher: ILib1Launcher = new Lib1Launcher({
          domElement: container,
          items: items
        } as ILib1LauncherProps);
        lib1Launcher.launch();
      }
      else {
        console.error(`${this.LOG_SOURCE}(_render) Top Placeholder not available!`);
      }
    }
    catch (err) {
      console.error(`${this.LOG_SOURCE}(_render): ${err}`);
    }
  }
}
