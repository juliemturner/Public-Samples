import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { sp } from "@pnp/sp";
import * as lodash from "lodash";

import Guage from './Guage';
import styles from "./BIDemoGuage.module.scss";
import { MSGraphClient } from "@microsoft/sp-http";

import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

export interface IITRequest {
  Id: string;
  Title: string;
  BusinessUnit: string;
  Category: string;
  Status: string;
  DueDate: Date;
  AssignedToId: string;
  Assigned: { Title: string, SipAddress: string };
}

export class ITRequest implements IITRequest {
  constructor(
    public Id: string = "",
    public Title: string = "",
    public BusinessUnit: string = "",
    public Category: string = "",
    public Status: string = "",
    public DueDate: Date = null,
    public AssignedToId: string = "",
    public Assigned: { Title: string, SipAddress: string } = { Title: "", SipAddress: "" }
  ) { }
}

export interface IUsers {
  Assigned: string;
  UserId: string;
  FirstName: string;
  Image: any;
  Assignments: number;
}

export class Users implements IUsers {
  constructor(
    public Assigned: string = "",
    public UserId: string = "",
    public FirstName: string = "",
    public Image: any = null,
    public Assignments: number = 1
  ) { }
}

export interface IBIDemoGuageProps {
  graphClient: MSGraphClient;
}

export interface IBIDemoGuageState {
  users: IUsers[];
}

export class BIDemoGuageState implements IBIDemoGuageState {
  constructor(
    public users: IUsers[] = []
  ) { }
}

export default class BIDemoGuage extends React.PureComponent<IBIDemoGuageProps, IBIDemoGuageState> {
  private LOG_SOURCE: string = "BIDemoGuage";

  constructor(props) {
    super(props);
    this.state = new BIDemoGuageState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IBIDemoGuageProps>, nextState: Readonly<IBIDemoGuageState>) {
    if ((lodash.isEqual(nextState, this.state) && lodash.isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentDidMount(): void {
    this.loadRequests();
  }

  private async loadRequests(): Promise<void> {
    let response = await sp.web.lists.getByTitle("IT Requests").items.select("Id", "BusinessUnit", "Category", "Status", "DueDate", "AssignedToId", "AssignedTo/Title", "AssignedTo/SipAddress").expand("AssignedTo").top(5000).get<[{ Id: string, BusinessUnit: string, Category: string, Status: string, DueDate: string, AssignedToId: string, AssignedTo: { Title: string, SipAddress: string } }]>();

    let itRequests: IITRequest[] = [];
    for (let i = 0; i < response.length; i++) {
      let item = new ITRequest();
      item.Id = response[i].Id;
      item.BusinessUnit = response[i].BusinessUnit;
      item.Category = response[i].Category;
      item.Status = response[i].Status;
      if (response[i].DueDate != undefined)
        item.DueDate = new Date(response[i].DueDate);
      if (response[i].AssignedToId != undefined)
        item.AssignedToId = response[i].AssignedToId;
      if (response[i].AssignedTo != undefined)
        item.Assigned = { Title: response[i].AssignedTo.Title.split(" ")[0], SipAddress: response[i].AssignedTo.SipAddress };
      itRequests.push(item);
    }

    let users: IUsers[] = [];
    for (let r = 0; r < itRequests.length; r++) {
      let req = itRequests[r];
      if (req.Assigned != null) {
        let idx = -1;
        let assigned = req.Assigned.Title;
        let bu = req.BusinessUnit;
        for (let u = 0; u < users.length; u++) {
          if (assigned === users[u].Assigned) {
            idx = u;
            break;
          }
        }

        if (idx === -1) {
          //Get user image
          let userImage = await this.props.graphClient.api("/me/photo/$value").responseType('blob').get();
          let url = window.URL; //|| window.webkitURL;
          let blobUrl = url.createObjectURL(userImage);

          //let userImage = "/_layouts/15/userphoto.aspx?size=L&accountname=" + req.Assigned.SipAddress + "&url=";
          users.push(new Users(assigned, req.AssignedToId, assigned.split(" ")[0], blobUrl));
        } else {
          users[idx].Assignments++;
        }
      }
    }
    this.setState({ users: users });
    return;
  }

  public render(): React.ReactElement<IBIDemoGuageProps> {
    if (this.state.users.length < 1) return null;
    try {
      return (
        <div className={`${styles.biDemoGuage} ${styles.guageCont}`}>
          {this.state.users.map((u) => {
            return (
              <Guage
                image={u.Image}
                username={u.FirstName}
                currentValue={u.Assignments}
                scale={700}
              />
            );
          })}
        </div>
      );
    } catch (err) {
      console.error(`${err} - ${this.LOG_SOURCE} (render)`);
      return null;
    }
  }
}