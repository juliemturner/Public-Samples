import React from "react";
import ReactDOM from "react-dom";


//Include CSS in bundle
import '../component/Lib1Styles.css';

import Container from "../component/Container";
import { IContainerProps } from "../component/Container";
import { ILibItem } from "@juliemturner/lib1_1";

export interface ILib1LauncherProps {
  domElement: HTMLDivElement; //dom element to bind nav
  items: ILibItem[];
}

export interface ILib1Launcher {
  launch: () => void;
}

export class Lib1Launcher implements ILib1Launcher {
  private domElementHeader: HTMLDivElement;
  private items: ILibItem[];

  constructor(props: ILib1LauncherProps) {
    console.log("Lib1Launcher constructor");
    try {
      this.domElementHeader = props.domElement;
      this.items = props.items;
    } catch (err) {
      console.error(`Lib1Launcher (constructor) ${err}`);
    }
  }

  public launch(): void {
    console.log("Lib1Launcher launch");
    this.renderHeader();
  }

  private renderHeader(): void {
    console.log("Lib1Launcher render");
    try {
      var containerElement = document.createElement("DIV");
      this.domElementHeader.appendChild(containerElement);

      const header = React.createElement("h2", null, "My list of items");

      const props: IContainerProps = { items: this.items }
      const container = React.createElement(Container, props, null);

      const elements = [header, container];

      //render
      ReactDOM.render(elements, containerElement);
      console.log("Lib1Launcher render complete");
    } catch (err) {
      console.error(`Lib1Launcher (renderHeader) ${err}`);
    }
  }
}
