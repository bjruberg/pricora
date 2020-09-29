import * as Types from '../../gql.d';

export type ChangePasswordMutationVariables = Types.Exact<{
  currentPassword: Types.Scalars['String'];
  newPassword: Types.Scalars['String'];
}>;


export type ChangePasswordMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'changePassword'>
);
