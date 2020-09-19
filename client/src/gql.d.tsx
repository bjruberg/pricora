import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  meetings: Array<Meeting>;
};

export type Meeting = {
  id: Scalars['ID'];
  title: Scalars['String'];
  user: User;
  archived: Scalars['Boolean'];
  created: Scalars['String'];
  updated: Scalars['String'];
};

export type User = {
  id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
};

export type Mutation = {
  createMeeting: Meeting;
};


export type MutationCreateMeetingArgs = {
  input: CreateMeetingInput;
};

export type CreateMeetingInput = {
  title: Scalars['String'];
};

export type AddMeetingMutationVariables = Exact<{
  meeting: CreateMeetingInput;
}>;


export type AddMeetingMutation = { createMeeting: Pick<Meeting, 'id'> };

export type GetMeetingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeetingsQuery = { meetings: Array<Pick<Meeting, 'id'>> };


export const AddMeetingDocument = gql`
    mutation addMeeting($meeting: CreateMeetingInput!) {
  createMeeting(input: $meeting) {
    id
  }
}
    `;

export function useAddMeetingMutation() {
  return Urql.useMutation<AddMeetingMutation, AddMeetingMutationVariables>(AddMeetingDocument);
};
export const GetMeetingsDocument = gql`
    query getMeetings {
  meetings {
    id
  }
}
    `;

export function useGetMeetingsQuery(options: Omit<Urql.UseQueryArgs<GetMeetingsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetMeetingsQuery>({ query: GetMeetingsDocument, ...options });
};