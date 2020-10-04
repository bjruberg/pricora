import * as Types from '../../gql.d';

export type GetMeetingDetailsQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type GetMeetingDetailsQuery = (
  { __typename?: 'Query' }
  & { meeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'archived' | 'date' | 'title'>
    & { user: (
      { __typename?: 'User' }
      & Pick<Types.User, 'id' | 'firstName' | 'lastName' | 'isAdmin'>
    ) }
  ) }
);

export type DeleteMeetingMutationVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type DeleteMeetingMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'deleteMeeting'>
);
