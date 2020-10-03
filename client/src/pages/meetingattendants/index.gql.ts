import * as Types from '../../gql.d';

export type GetMeetingDetailsAttendantsQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type GetMeetingDetailsAttendantsQuery = (
  { __typename?: 'Query' }
  & { meeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'date' | 'title'>
    & { attendants: (
      { __typename?: 'Attendants' }
      & Pick<Types.Attendants, 'error'>
      & { list: Array<(
        { __typename?: 'EntryOutput' }
        & Pick<Types.EntryOutput, 'created' | 'id' | 'email' | 'firstName' | 'lastName' | 'phone'>
      )> }
    ) }
  ) }
);
