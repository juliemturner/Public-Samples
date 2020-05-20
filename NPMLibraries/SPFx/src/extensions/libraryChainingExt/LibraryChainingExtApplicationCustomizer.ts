import { override } from '@microsoft/decorators';
import {
  BaseApplicationCustomizer, PlaceholderName
} from '@microsoft/sp-application-base';

require('react');
require('react-dom');
import { Lib1Launcher, ILib1Launcher, ILib1LauncherProps } from "@juliemturner/lib1";
require("@juliemturner/lib1_1");
import * as strings from 'LibraryChainingExtApplicationCustomizerStrings';

const LOG_SOURCE: string = 'LibraryChainingExtApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ILibraryChainingExtApplicationCustomizerProperties {
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class LibraryChainingExtApplicationCustomizer
  extends BaseApplicationCustomizer<ILibraryChainingExtApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    console.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    this.context.application.navigatedEvent.add(this, this.render);

    return Promise.resolve();
  }

  private async render(): Promise<void> {

    try {
      console.info(LOG_SOURCE, `Start [render]`);
      let topPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this.onDispose });
      if (topPlaceholder != undefined) {
        console.info(LOG_SOURCE, `starting to render global header! [${strings.Title}]`);
        let topContainer: HTMLDivElement = document.createElement("DIV") as HTMLDivElement;
        topPlaceholder.domElement.appendChild(topContainer);

        //Set up header launcher
        let items = [
          { title: "Test Item 1", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" },
          { title: "Test Item 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" },
          { title: "Test Item 3", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" },
          { title: "Test Item 4", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit", url: "https://bing.com" }
        ];

        const lib1Launcher: ILib1Launcher = new Lib1Launcher({
          domElement: topContainer,
          items: items
        } as ILib1LauncherProps);
        lib1Launcher.launch();
        console.info(LOG_SOURCE, `Render global header complete [${strings.Title}]`);
      } else {
        console.error(LOG_SOURCE, new Error(`Top Placeholder not available! [${strings.Title}]`));
      }
    }
    catch (err) {
      console.error(LOG_SOURCE, err);
    }
  }
}
