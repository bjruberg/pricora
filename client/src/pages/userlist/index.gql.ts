import * as Types from '../../gql.d';

export type UsersQueryQueryVariables = Types.Exact<{
  deleted: Types.Scalars['Boolean'];
}>;


export type UsersQueryQuery = (
  { __typename?: 'Query' }
  & { users: Array<(
    { __typename?: 'User' }
    & Pick<Types.User, 'deletedAt' | 'id' | 'email' | 'firstName' | 'isAdmin' | 'lastName'>
    & { meetings: Array<(
      { __typename?: 'Meeting' }
      & Pick<Types.Meeting, 'id'>
    )> }
  )> }
);

export type ToggleUserAdminMutationVariables = Types.Exact<{
  on: Types.Scalars['Boolean'];
  userId: Types.Scalars['String'];
}>;


export type ToggleUserAdminMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'toggleUserAdmin'>
);

export type DeleteUserMutationMutationVariables = Types.Exact<{
  userId: Types.Scalars['String'];
}>;


export type DeleteUserMutationMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'deleteUser'>
);

export type RestoreUserMutationVariables = Types.Exact<{
  userId: Types.Scalars['String'];
}>;


export type RestoreUserMutation = (
  { __typename?: 'Mutation' }
  & Pick<Types.Mutation, 'restoreUser'>
);
