import * as Types from '../gql.d';

export type CreateMeetingTokenMutationVariables = Types.Exact<{
  meetingId: Types.Scalars['String'];
}>;


export type CreateMeetingTokenMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'createAuthToken'>
);
