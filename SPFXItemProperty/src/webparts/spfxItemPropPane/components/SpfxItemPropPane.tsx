import * as React from 'react';
import styles from './SpfxItemPropPane.module.scss';
import { ISpfxItemPropPaneProps } from './ISpfxItemPropPaneProps';
import { escape } from '@microsoft/sp-lodash-subset';

import { CommandButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';


export default class SpfxItemPropPane extends React.Component<ISpfxItemPropPaneProps, void> {

  constructor(){
    super();
  }

  //Calls the editItem function defined whyen the component was declared (adding a new item)
  public addBox(event){    
    this.props.editItem(-1);
  }

  //Calls the editItem function with the item that should be edited.
  public editBox(event){
    event.stopPropagation();
    event.preventDefault();
    this.props.editItem(event.target.closest('[data-index]').getAttribute("data-index"));
    return false;
  }

  public render(): React.ReactElement<ISpfxItemPropPaneProps> {
    return this.renderBasicWebPart();
  }

  //HTML template for the body of the web part.
  public renderBasicWebPart(): JSX.Element {
    return (
      <div className={styles["testPart"]}>
        <h2>{this.props.title}</h2>
        <CommandButton className={styles["grayButton"]} onClick={this.addBox.bind(this)}>New Link Item</CommandButton>
        { this.props.linkItems &&
             this.props.linkItems.map((item) => { 
               return (
              <div id={"item-"+this.props.linkItems.indexOf(item)} 
                   key={"item-"+this.props.linkItems.indexOf(item)}
                   data-index={this.props.linkItems.indexOf(item)}>
                  <a href={item.url}>{item.title}</a><span> - {item.description}</span>
                  <div className={styles["editControls"]}>
                    <DefaultButton icon="Edit" onClick={this.editBox.bind(this)} className={styles["right-button"]}/>
                  </div>                   
              </div>         
               );
            })
         }     
      </div>
    );
  }
}
