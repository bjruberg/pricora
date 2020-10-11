import * as Types from '../../gql.d';

export type AddMeetingMutationVariables = Types.Exact<{
  meeting: Types.MeetingInput;
}>;


export type AddMeetingMutation = (
  { __typename?: 'Mutation' }
  & { createMeeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id'>
  ) }
);

export type GetUnlockedAdminsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUnlockedAdminsQuery = (
  { __typename?: 'Query' }
  & { unlockedAdmins: Array<(
    { __typename?: 'User' }
    & Pick<Types.User, 'id' | 'firstName' | 'lastName'>
  )> }
);
