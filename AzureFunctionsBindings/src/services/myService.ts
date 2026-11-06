import { SqlChangeOperation } from "@azure/functions";
import { IJobStatus, IMyQueueItem } from "../models/models";

export interface IMyService {
  ProcessQueueItem: (item: IMyQueueItem) => boolean;
  ProcessBlobItem: (item: Buffer) => boolean;
  ProcessSqlChange: (item: IJobStatus, operation: SqlChangeOperation) => boolean;
}

export class MyService implements IMyService {
  public ProcessQueueItem(item: IMyQueueItem): boolean {
    let retVal = false;
    try{
      // Do something with the queue item.
      console.log(item.id);
      retVal = true;
    }catch(err){
      console.error(err)
    }
    return retVal;
  }

  public ProcessBlobItem(item: Buffer): boolean {
    let retVal = false;
    try{
      // Do something with the blob item.
      console.log(item);
      retVal = true;
    }catch(err){
      console.error(err)
    }
    return retVal;
  }

  public ProcessSqlChange(item: IJobStatus, operation: SqlChangeOperation): boolean {
    let retVal = false;
    try{
      // Do something with the changed row.
      console.log(SqlChangeOperation[operation], item);
      retVal = true;
    }catch(err){
      console.error(err)
    }
    return retVal;
  }
}

export const myService = new MyService();