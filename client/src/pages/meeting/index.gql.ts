import * as Types from '../../gql.d';

export type CreateMeetingTokenMutationVariables = Types.Exact<{
  meetingId: Types.Scalars['String'];
}>;


export type CreateMeetingTokenMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'createAuthToken'>
);

export type GetMeetingDetailsQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type GetMeetingDetailsQuery = (
  { __typename?: 'Query' }
  & { meeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'archived' | 'date' | 'title'>
    & { attendants: (
      { __typename?: 'Attendants' }
      & Pick<Types.Attendants, 'error'>
      & { list: Array<(
        { __typename?: 'EntryOutput' }
        & Pick<Types.EntryOutput, 'id' | 'firstName' | 'lastName'>
      )> }
    ) }
  ) }
);
