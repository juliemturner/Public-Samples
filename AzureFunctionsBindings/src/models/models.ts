export interface IMyQueueItem{
  id: number;
}

export interface IBindingInfo {
  lastRun: Date;
}

export interface IJobStatus {
  JobFamilyName: string;
  SPSiteUrl: string;
  LastToken: string;
  LastUpdated: string;
}