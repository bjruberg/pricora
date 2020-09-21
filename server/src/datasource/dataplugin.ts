export interface ISourcePlugin {
  getMeetingList(): Promise<string[]>;
}

export interface SourcePlugin {
  // eslint-disable-next-line prettier/prettier
  new(): ISourcePlugin;
}
