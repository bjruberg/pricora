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
  exportsCount: Scalars['Float'];
  numberOfAttendants: Scalars['Float'];
  created: Scalars['String'];
  updated: Scalars['String'];
  attendants: Attendants;
};

export type User = {
  id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  requirePasswordChange: Scalars['Boolean'];
};

export type Attendants = {
  list: Array<EntryOutput>;
  error: Scalars['String'];
};

export type EntryOutput = {
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  random?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  created: Scalars['String'];
};

export type Mutation = {
  createMeeting: Meeting;
  addAttendant: Scalars['Boolean'];
  createAuthToken: Scalars['String'];
  changePassword: Scalars['Boolean'];
};


export type MutationCreateMeetingArgs = {
  input: MeetingInput;
};


export type MutationAddAttendantArgs = {
  meeting: Scalars['String'];
  input: EntryInput;
};


export type MutationCreateAuthTokenArgs = {
  meetingId: Scalars['String'];
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
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  random?: Maybe<Scalars['String']>;
};

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: Scalars['String'];
  newPassword: Scalars['String'];
}>;


export type ChangePasswordMutation = Pick<Mutation, 'changePassword'>;

export type GetMeetingQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMeetingQuery = { meeting: Pick<Meeting, 'id' | 'archived' | 'date' | 'title'> };

export type AddAttendantMutationVariables = Exact<{
  id: Scalars['String'];
  input: EntryInput;
}>;


export type AddAttendantMutation = Pick<Mutation, 'addAttendant'>;

export type GetMeetingDetailsQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMeetingDetailsQuery = { meeting: Pick<Meeting, 'id' | 'archived' | 'date' | 'title'> };

export type AddMeetingMutationVariables = Exact<{
  meeting: MeetingInput;
}>;


export type AddMeetingMutation = { createMeeting: Pick<Meeting, 'id'> };

export type GetMeetingDetailsAttendantsQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMeetingDetailsAttendantsQuery = { meeting: (
    Pick<Meeting, 'id' | 'date' | 'title'>
    & { attendants: (
      Pick<Attendants, 'error'>
      & { list: Array<Pick<EntryOutput, 'created' | 'id' | 'email' | 'firstName' | 'lastName' | 'phone'>> }
    ) }
  ) };

export type GetMeetingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeetingsQuery = { meetings: Array<Pick<Meeting, 'id' | 'date' | 'archived' | 'title'>> };

export type CreateMeetingTokenMutationVariables = Exact<{
  meetingId: Scalars['String'];
}>;


export type CreateMeetingTokenMutation = Pick<Mutation, 'createAuthToken'>;
