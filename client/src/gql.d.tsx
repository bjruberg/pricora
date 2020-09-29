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
  title: Scalars['String'];
  date: Scalars['String'];
  id: Scalars['ID'];
  user: User;
  archived: Scalars['Boolean'];
  created: Scalars['String'];
  updated: Scalars['String'];
  attendants: Array<EntryOutput>;
};

export type User = {
  id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
};

export type EntryOutput = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  address: Scalars['String'];
  zip: Scalars['String'];
  city: Scalars['String'];
  country: Scalars['String'];
  id: Scalars['ID'];
  created: Scalars['String'];
};

export type Mutation = {
  createMeeting: Meeting;
  addAttendant: Scalars['Boolean'];
  changePassword: Scalars['Boolean'];
};


export type MutationCreateMeetingArgs = {
  input: MeetingInput;
};


export type MutationAddAttendantArgs = {
  meeting: Scalars['String'];
  input: EntryInput;
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String'];
  currentPassword: Scalars['String'];
};

export type MeetingInput = {
  title: Scalars['String'];
  date: Scalars['String'];
};

export type EntryInput = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  address: Scalars['String'];
  zip: Scalars['String'];
  city: Scalars['String'];
  country: Scalars['String'];
};

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type ChangePasswordMutation = Pick<Mutation, 'changePassword'>;

export type GetMeetingQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMeetingQuery = { meeting: Pick<Meeting, 'id' | 'archived' | 'title'> };

export type AddAttendantMutationVariables = Exact<{
  id: Scalars['String'];
  input: EntryInput;
}>;


export type AddAttendantMutation = Pick<Mutation, 'addAttendant'>;

export type GetMeetingDetailsQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMeetingDetailsQuery = { meeting: (
    Pick<Meeting, 'id' | 'archived' | 'title'>
    & { attendants: Array<Pick<EntryOutput, 'id' | 'firstName' | 'lastName'>> }
  ) };

export type AddMeetingMutationVariables = Exact<{
  meeting: MeetingInput;
}>;


export type AddMeetingMutation = { createMeeting: Pick<Meeting, 'id'> };

export type GetMeetingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeetingsQuery = { meetings: Array<Pick<Meeting, 'id' | 'date' | 'archived' | 'title'>> };
