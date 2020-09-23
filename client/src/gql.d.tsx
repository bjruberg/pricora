export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
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
  meeting: Meeting;
};


export type QueryMeetingArgs = {
  id: Scalars['String'];
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

export type GetMeetingQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMeetingQuery = { meeting: Pick<Meeting, 'id' | 'archived' | 'title'> };

export type AddMeetingMutationVariables = Exact<{
  meeting: CreateMeetingInput;
}>;


export type AddMeetingMutation = { createMeeting: Pick<Meeting, 'id'> };

export type GetMeetingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeetingsQuery = { meetings: Array<Pick<Meeting, 'id' | 'archived' | 'title'>> };
