import * as Types from '../../gql.d';

export type GetMeetingShareQueryVariables = Types.Exact<{
  id: Types.Scalars['String'];
}>;


export type GetMeetingShareQuery = (
  { __typename?: 'Query' }
  & { meeting: (
    { __typename?: 'Meeting' }
    & Pick<Types.Meeting, 'id' | 'archived' | 'date' | 'title'>
  ) }
);
