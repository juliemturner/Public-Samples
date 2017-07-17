import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'spfxItemPropPaneStrings';
import SpfxItemPropPane from './components/SpfxItemPropPane';
import { ISpfxItemPropPaneProps } from './components/ISpfxItemPropPaneProps';
import { ISpfxItemPropPaneWebPartProps } from './ISpfxItemPropPaneWebPartProps';
import { LinksItem } from './components/ILinkItemProps';

export default class SpfxItemPropPaneWebPart extends BaseClientSideWebPart<ISpfxItemPropPaneWebPartProps> {
  //Index of current item being edited.
  private _activeIndex : number = -1;

  //Get & Set function for our activeIndex property.
  public get activeIndex() : number {
    return this._activeIndex;
  }
  public set activeIndex(v : number) {
    this._activeIndex = v;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  //Web parts render function
  public render(): void {
    //Declare the react component for the body of the web part
    const element: React.ReactElement<ISpfxItemPropPaneProps > = React.createElement(
      SpfxItemPropPane,
      {
        //Web parts title, set in the web part property pane
        title: this.properties.title,
        //Array of link items that I want to display in my web part.
        linkItems: this.properties.linkItems,
        //Function that calls the item property pane
        editItem: (index:number)=>{
          //If index is negative 1 then the add button was clicked.
          if(index===-1){
            this.properties.linkItems.push(new LinksItem("Link"));
            index = this.properties.linkItems.length-1;
          }          
          this.activeIndex = index;
          //triggers getPropertyPaneConfiguration, where isREnderedByWebPart will return true
          this.context.propertyPane.open();          
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  //Function to display the property pane.
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    //isRenderedByWebPart is true when the property pane is being opened becuase of a code call and false if it's being opened due to the user clicking the web parts edit icon.
    if(this.context.propertyPane.isRenderedByWebPart()) return this.getItemPropertyPaneConfiguration();
    return this.getWebPartPropertyPaneConfiguration();
  }

  //Basic web part property pane configuration that is normally in the getPropertyPaneConfiguration protected function, split out here so that we can add an additional property pane.
  private getWebPartPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Web Part Properties"
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: "Web Part Title"
                })
              ]
            }
          ]
        }
      ]
    };
  }

  //Property pane configuration for the item pane, note that there are text fields for each of the items in my link item's properties.
  private getItemPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Item Properties"
          },
          displayGroupsAsAccordion:false,
          groups: [
            {
              groupName: "Item Properties",
              groupFields:[
                PropertyPaneTextField("linkItems["+this.activeIndex+"].title",{
                  label: "Link Title"
                }),
                PropertyPaneTextField("linkItems["+this.activeIndex+"].description",{
                  label: "Link Description"
                }),
                PropertyPaneTextField("linkItems["+this.activeIndex+"].url",{
                  label: "Link URL"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
