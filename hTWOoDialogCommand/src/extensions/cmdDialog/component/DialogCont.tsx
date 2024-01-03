import HOODialog, { HOODialogType } from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";
import HOODialogHeader from "@n8d/htwoo-react/HOODialogHeader";
import * as React from "react";

export interface IDialogContProps {
  closeForm: () => void;
}

export interface IDialogContState {}

export default class DialogCont extends React.PureComponent<IDialogContProps, IDialogContState> {
  private LOG_SOURCE = "🟢DialogCont";

  public constructor(props: IDialogContProps) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactElement<IDialogContProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <HOODialog type={HOODialogType.SidebarRight} width="30vw" visible={true} changeVisibility={this.props.closeForm}>
            <HOODialogHeader
              closeIconName="hoo-icon-close"
              closeOnClick={this.props.closeForm}
              title="Sidebar Dialog Title Area"
              closeDisabled={false} />
            <HOODialogContent>
              <p>This area would contain your UI for whatever interactions you need to support.</p>
            </HOODialogContent>
          </HOODialog>
        </div>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}