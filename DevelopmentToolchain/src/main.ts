"use strict";
import './styles/demo.css';
import * as React from "react";
import * as ReactDom from "react-dom";
import MyComponent from "./components/MyComponent";
import { IMyComponentProps } from "./components/MyComponent";

export class WebpackDemo {
  constructor(domElement: Element) {
    const element: React.ReactElement<IMyComponentProps> = React.createElement(
      MyComponent, { title: "This is my component" }
    );

    ReactDom.render(element, domElement);
  }
}

