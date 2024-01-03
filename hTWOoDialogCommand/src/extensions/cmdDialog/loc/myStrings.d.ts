declare interface ICmdDialogCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CmdDialogCommandSetStrings' {
  const strings: ICmdDialogCommandSetStrings;
  export = strings;
}
