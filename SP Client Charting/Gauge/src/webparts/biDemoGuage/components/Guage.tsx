import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import * as lodash from "lodash";

import styles from "./BIDemoGuage.module.scss";

export interface IGuageProps {
  image: string;
  username: string;
  currentValue: number;
  scale: number;
}

export interface IGuageState {
  W: number;
  H: number;
}

export class GuageState implements IGuageState {
  constructor(
    public W: number = 0,
    public H: number = 0
  ) { }
}

export default class Guage extends React.PureComponent<IGuageProps, IGuageState> {
  private LOG_SOURCE: string = "Guage";

  private refresh: boolean = false;

  private guageCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D; //= element[0].children[0].getContext("2d");
  // private W: number = 0; //= element[0].children[0].offsetWidth;
  // private H: number = 0; // = element[0].children[0].offsetHeight;

  private degrees: number = 0;
  private color: string = "#000000";
  private bgColor: string = "white";
  private lineWidth: number = 17;
  private animationLoop: number;

  constructor(props) {
    super(props);
    this.state = new GuageState();
  }

  public componentDidMount(): void {
    this.ctx = this.guageCanvas.getContext("2d");
    this.setState({
      W: this.guageCanvas.parentElement.offsetWidth,
      H: this.guageCanvas.parentElement.offsetWidth
    }, () => {
      this.ctx.canvas.width = this.state.W;
      this.ctx.canvas.height = this.state.H;

      if (!isNaN(this.props.currentValue))
        this.drawCanvas(this.props.currentValue);
      else
        this.drawCanvas(1);
    });
    // this.W = this.guageCanvas.parentElement.offsetWidth;
    // this.state.H = this.W;
    // this.ctx.canvas.width = this.W;
    // this.ctx.canvas.height = this.state.H;

    // if (!isNaN(this.props.currentValue))
    //   this.drawCanvas(this.props.currentValue);
    // else
    //   this.drawCanvas(1);
  }

  public shouldComponentUpdate(nextProps: Readonly<IGuageProps>, nextState: Readonly<IGuageState>) {
    if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
      return false;
    if (nextProps.currentValue !== this.props.currentValue) {
      this.refresh = true;
    }

    return true;
  }

  public componentDidUpdate(): void {
    if (this.refresh) {
      this.refresh = false;
    }
  }

  private initCanvas(): void {
    this.degrees = this.degrees < 1 ? 1 : this.degrees;
    if (this.degrees > 0 && this.degrees < 120) {
      this.color = "rgba(68, 223, 0,";  //green
    } else if (this.degrees >= 120 && this.degrees < 240) {
      this.color = "rgba(255, 222, 0,";  //yellow
    } else {
      this.color = "rgba(223, 0, 0,";  //red
    }

    //Clear the canvas every time a chart is drawn
    this.ctx.clearRect(0, 0, this.state.W, this.state.H);

    //Background 360 degree arc
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.bgColor;
    this.ctx.lineWidth = this.lineWidth + 1;
    this.ctx.arc(this.state.W / 2, this.state.H / 2, (this.state.W - this.lineWidth) / 2, 0, Math.PI * 2, false); //you can see the arc now
    this.ctx.stroke();
    this.ctx.closePath();

    //Guage arc
    //Angle in radians = angle in degrees * PI / 180
    let radians = this.degrees * Math.PI / 180;
    let radiansDash = 2 * Math.PI / 180;
    let radiansSegment = 30 * Math.PI / 180;
    let rStart = 0;
    let rEnd = 0;
    //Calculate # of segments to draw
    let segments = Math.ceil(radians / radiansSegment);
    let opacity = 1 / segments;
    for (let l = 1; l <= segments; l++) {
      rEnd = radiansSegment * l;
      //Adjust for last segment - includ dash
      rEnd = rEnd >= radians ? radians + radiansDash : rEnd;
      //Draw arc segment
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.color + (opacity * l) + ")";
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.arc(this.state.W / 2, this.state.H / 2, (this.state.W - this.lineWidth) / 2, rStart - 90 * Math.PI / 180, (rEnd - radiansDash) - 90 * Math.PI / 180, false);
      this.ctx.stroke();
      this.ctx.closePath();
      //Draw dash -- skip if end
      if (rEnd < radians) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.bgColor;
        this.ctx.arc(this.state.W / 2, this.state.H / 2, (this.state.W - this.lineWidth) / 2, (rEnd - radiansDash) - 90 * Math.PI / 180, rEnd - 90 * Math.PI / 180, false);
        this.ctx.stroke();
        this.ctx.closePath();
      }
      //Save Start
      rStart = rEnd;
    }
    //Mask player picture as circle
    let maskCanvas = document.createElement('canvas');
    maskCanvas.width = this.state.W;
    maskCanvas.height = this.state.H;
    let maskCtx = maskCanvas.getContext('2d');
    maskCtx.fillStyle = this.bgColor;
    maskCtx.fillRect(0, 0, this.state.W, this.state.H);
    maskCtx.globalCompositeOperation = 'xor';
    // Draw the shape you want to take out
    maskCtx.arc(this.state.W / 2, this.state.H / 2, this.state.W / 2, 0, Math.PI * 2, false);
    maskCtx.fill();
    this.ctx.drawImage(maskCanvas, 0, 0);
  }

  private animateTo(newDegrees: number): void {
    if (this.degrees == newDegrees) {
      clearInterval(this.animationLoop);
    }

    if (this.degrees < newDegrees)
      this.degrees++;
    else
      this.degrees--;
    this.initCanvas();
  }

  private drawCanvas(currentValue: number): void {
    if (typeof this.animationLoop != undefined) clearInterval(this.animationLoop);
    let newDegrees = Math.round(360 * (currentValue / this.props.scale));
    newDegrees = newDegrees < 1 ? 1 : newDegrees;
    let difference = newDegrees - this.degrees;
    this.animationLoop = setInterval(() => { this.animateTo(newDegrees); }, 1000 / difference);
  }

  public render(): React.ReactElement<IGuageProps> {
    try {
      return (
        <div className={styles.guage}>
          <div className={styles.canvasCont} style={{ height: this.state.H }}>
            <img className={styles.userImage} src={this.props.image} width={this.state.W} height={this.state.H} />
            <canvas ref={(guageCanvas) => { this.guageCanvas = guageCanvas; }} className={styles.userGuage} ></canvas>
          </div>
          <div className={styles.userText}>
            <span>{this.props.username}: {this.props.currentValue}</span>
          </div>
        </div>
      );
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (render)`);
      return null;
    }
  }
}