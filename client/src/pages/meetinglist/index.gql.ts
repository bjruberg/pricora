import * as Types from '../../gql.d';

export type GetMeetingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetMeetingsQuery = (
  { __typename?: 'Query' }
  & { meetings: Array<(
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'date' | 'archived' | 'title'>
  )> }
);
