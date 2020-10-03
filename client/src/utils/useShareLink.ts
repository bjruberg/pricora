import gql from "graphql-tag";
import { useMutation, UseMutationResponse } from "@urql/preact";
import {
  CreateMeetingTokenMutation,
  CreateMeetingTokenMutationVariables,
} from "./useShareLink.gql";

import { hostname } from "../constants";
import { routes } from "../routes";

export const createMeetingTokenMutation = gql`
  mutation createMeetingToken($meetingId: String!) {
    createAuthToken(meetingId: $meetingId)
  }
`;

type respType = UseMutationResponse<
  CreateMeetingTokenMutation,
  CreateMeetingTokenMutationVariables
>;

export const useShareLink = (uuid: string): [...respType, string | undefined] => {
  const resp = useMutation<CreateMeetingTokenMutation, CreateMeetingTokenMutationVariables>(
    createMeetingTokenMutation,
  );

  if (!resp[0].data) {
    return [...resp, undefined];
  }

  const shareLink = `${hostname}${routes.addattendant(uuid)}?auth=${resp[0].data.createAuthToken}`;

  return [...resp, shareLink];
};
