import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider } from '@microsoft/sp-component-base';

import { symset } from "@n8d/htwoo-react/SymbolSet";
import { ISPFxThemes, SPFxThemes } from "@n8d/htwoo-react/SPFxThemes";

import AtomicDesign, { IAtomicDesignProps } from './components/AtomicDesign';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IAtomicDesignWebPartProps {
}

export default class AtomicDesignWebPart extends BaseClientSideWebPart<IAtomicDesignWebPartProps> {
  private LOG_SOURCE = "🔶AtomicDesignWebPart";

  private _spfxThemes: ISPFxThemes = new SPFxThemes();

  public async onInit(): Promise<void> {
    try {
      // Initialize Icons Symbol Set
      await symset.initSymbols();

      // Consume the new ThemeProvider service
      const microsoftTeams = this.context.sdks?.microsoftTeams;
      const themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
      this._spfxThemes.initThemeHandler(this.domElement, themeProvider, microsoftTeams);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (onInit) - ${err}`);
    }
  }


  public render(): void {
    try {
      const element: React.ReactElement<IAtomicDesignProps> = React.createElement(
        AtomicDesign, {}
      );

      ReactDom.render(element, this.domElement);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
