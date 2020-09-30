import * as Types from '../../gql.d';

export type GetMeetingQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type GetMeetingQuery = (
  { __typename?: 'Query' }
  & { meeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'archived' | 'date' | 'title'>
  ) }
);

export type AddAttendantMutationVariables = Types.Exact<{
  id: Types.Scalars['String'];
  input: Types.EntryInput;
}>;


export type AddAttendantMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'addAttendant'>
);
