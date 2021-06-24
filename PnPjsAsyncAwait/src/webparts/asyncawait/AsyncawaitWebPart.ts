import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

//Add reference to PnPjs
import { sp } from "@pnp/sp";
//Step 1
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/fields/list";
import { IList } from '@pnp/sp/lists';
import "@pnp/sp/views/list";
import { IFieldAddResult, IFieldInfo } from '@pnp/sp/fields/types';
import { IView, IViewAddResult } from '@pnp/sp/views/types';

//import * as strings from 'AsyncawaitWebPartStrings';
import Asyncawait, { IAsyncawaitProps } from './components/Asyncawait';

export interface IAsyncawaitWebPartProps {
}

export default class AsyncawaitWebPart extends BaseClientSideWebPart<IAsyncawaitWebPartProps> {
  private time: number = 0;

  //Add reference to onInit, setup PnPjs
  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
      sp.setup(this.context);
    });
  }


  //Create a list, field, view, and add field into view with Promise Chaining
  private _step1Promise(listName: string): Promise<boolean> {
    return new Promise((resolve) => {
      let l: IList;
      let f: Partial<IFieldInfo>;
      let v: IView;

      //Create the list
      sp.web.lists.add(listName).then((listResult) => {
        if (!listResult) { resolve(false); }
        l = listResult.list;
        //Create the text field
        return l.fields.addText("Step1TextField");
      },
        (listReject) => {
          console.log(`Error creating List ${JSON.stringify(listReject)}`);
          resolve(false);
        })
        .then((fieldResult: IFieldAddResult) => {
          if (!fieldResult) { resolve(false); }
          f = fieldResult.data;
          //Create the view
          return l.views.add("Step1View");
        },
          (fieldReject) => {
            console.log(`Error creating Field ${JSON.stringify(fieldReject)}`);
            resolve(false);
          })
        .then((viewResult: IViewAddResult) => {
          if (!viewResult) { resolve(false); }
          v = viewResult.view;
          //Add the field to the view
          return v.fields.add(f.InternalName);
        },
          (viewReject) => {
            console.log(`Error creating View ${JSON.stringify(viewReject)}`);
            resolve(false);
          })
        .then(_ => {
          //Resolve as completed successfully
          resolve(true);
        },
          (viewFieldReject) => {
            console.log(`Error adding field to view ${JSON.stringify(viewFieldReject)}`);
            resolve(false);
          });
    });
  }

  //Create a list, field, view, and add field into view with Async/Await
  private async _step1Async(listName: string): Promise<boolean> {
    let retVal: boolean = false;

    try {
      //Create the list
      let listResult = await sp.web.lists.add(listName);
      if (listResult.list) {
        //Create the text field
        let fieldResult = await listResult.list.fields.addText("Step1TextField");
        if (fieldResult.field) {
          //Create the view
          let viewResult = await listResult.list.views.add("Step1View");
          if (viewResult.view) {
            //Add the field to the view
            await viewResult.view.fields.add(fieldResult.data.InternalName);
            retVal = true;
          }
        }
      }
    } catch (err) {
      console.log(`Error creating custom list ${JSON.stringify(err)}`);
    }

    return retVal;
  }

  //Create a list, field, view, and add field into view 3x with Promises
  private _step2Promise(): Promise<boolean> {
    return new Promise((resolve) => {
      let listPromises = [];
      listPromises.push(this._step1Promise("Step2List1"));
      listPromises.push(this._step1Promise("Step2List2"));
      listPromises.push(this._step1Promise("Step2List3"));

      Promise.all(listPromises).then((results) => {
        let success: boolean = true;
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            success = false;
          }
        }
        resolve(success);
      });
    });
  }

  //Create a list, field, view, and add field into view 3x with Async/Await
  private async _step2Async(): Promise<boolean> {
    let retVal: boolean = true;

    try {
      let listPromises = [];
      listPromises.push(this._step1Async("Step2List1"));
      listPromises.push(this._step1Async("Step2List2"));
      listPromises.push(this._step1Async("Step2List3"));

      const results = await Promise.all(listPromises);
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) {
          retVal = false;
        }
      }
    } catch (err) {
      console.log(`Error creating custom lists ${JSON.stringify(err)}`);
    }

    return retVal;
  }

  //Track time and call this._step2Promise using Promises
  //  also uses binding syntax
  private startPromise = (): void => {
    let startTime = new Date();
    console.time("Promises");
    this._step2Promise().then((resolve) => {
      if (resolve) {
        console.timeEnd("Promises");
        let endTime = new Date();
        this.time = endTime.getTime() - startTime.getTime();
      } else {
        this.time = -1;
      }
      this.render();
    });
  }

  //Track time and call this._step2Async using Async/Await
  //  also uses binding syntax
  private startAsyncA = async (): Promise<void> => {
    let startTime = new Date();
    console.time("AsyncA");
    let result = await this._step2Async();
    if (result) {
      console.timeEnd("AsyncA");
      let endTime = new Date();
      this.time = endTime.getTime() - startTime.getTime();
    } else {
      this.time = -1;
    }
    this.render();
  }

  //Track time and call this._step2Async using Promises to terminate an Async/Await Chain
  //  also uses binding syntax
  private startAsyncB = (): void => {
    let startTime = new Date();
    console.time("AsyncB");
    this._step2Async().then((resolve) => {
      if (resolve) {
        console.timeEnd("AsyncB");
        let endTime = new Date();
        this.time = endTime.getTime() - startTime.getTime();
      } else {
        this.time = -1;
      }
      this.render();
    });
  }

  public render(): void {
    const element: React.ReactElement<IAsyncawaitProps> = React.createElement(
      Asyncawait, {
      type: "Aync",
      time: (this.time),
      start: this.startAsyncA
    });

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
      pages: []
    };
  }
}
