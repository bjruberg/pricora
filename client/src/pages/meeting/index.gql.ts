import * as Types from '../../gql.d';

export type GetMeetingDetailsQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type GetMeetingDetailsQuery = (
  { __typename?: 'Query' }
  & { meeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'archived' | 'title'>
    & { attendants: Array<(
      { __typename?: 'EntryOutput' }
      & Pick<Types.EntryOutput, 'id' | 'firstName' | 'lastName'>
    )> }
  ) }
);
