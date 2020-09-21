import * as Types from '../../gql.d';

export type AddMeetingMutationVariables = Types.Exact<{
  meeting: Types.CreateMeetingInput;
}>;


export type AddMeetingMutation = (
  { __typename?: 'Mutation' }
  & { createMeeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id'>
  ) }
);
