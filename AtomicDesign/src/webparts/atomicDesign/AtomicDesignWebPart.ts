import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
  ISemanticColors
} from '@microsoft/sp-component-base';

import * as strings from 'AtomicDesignWebPartStrings';
import AtomicDesign, { IAtomicDesignProps } from './components/AtomicDesign';

export interface IAtomicDesignWebPartProps {
}

export default class AtomicDesignWebPart extends BaseClientSideWebPart<IAtomicDesignWebPartProps> {
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  public async onInit(): Promise<void> {

    // Consume the new ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();

    // Assign theme slots
    if (this._themeVariant) {
      // output all theme theme variants
      console.log("LOG Theme variant:::", this._themeVariant);

      // transfer semanticColors into CSS variables
      this.setCSSVariables(this._themeVariant.semanticColors);

      // transfer fonts into CSS variables
      this.setCSSVariables(this._themeVariant.fonts);

      // transfer color palette into CSS variables
      this.setCSSVariables(this._themeVariant.palette);

      // transfer color palette into CSS variables
      this.setCSSVariables(this._themeVariant["effects"]);
    } else {
      // Fallback to core theme state options applicable for Single Canvas Apps and Microsoft Teams
      this.setCSSVariables(window["__themeState__"].theme);
    }

    // Register a handler to be notified if the theme variant changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);
  }

  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
  }

  /// Converts JSON Theme Slots it CSS variables
  private setCSSVariables(theming: any) {
    // request all key defined in theming
    let themingKeys = Object.keys(theming);
    // if we have the key
    if (themingKeys !== null) {
      // loop over it
      themingKeys.forEach(key => {
        // add CSS variable to style property of the web part
        this.domElement.style.setProperty(`--${key}`, theming[key]);
      });
    }
  }

  public render(): void {
    const element: React.ReactElement<IAtomicDesignProps> = React.createElement(
      AtomicDesign, {}
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
          ]
        }
      ]
    };
  }
}
