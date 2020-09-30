import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import { useQuery, useMutation } from "@urql/preact";
import gql from "graphql-tag";
import { map } from "lodash";
import QRCode from "qrcode.react";
import { Link } from "preact-router/match";
import { format, parseISO } from "date-fns";

import { downloadExport } from "./export";

import PageContainer from "../../components/PageContainer";
import {
  CreateMeetingTokenMutation,
  CreateMeetingTokenMutationVariables,
  GetMeetingDetailsQuery,
  GetMeetingDetailsQueryVariables,
} from "./index.gql";

import Button from "../../ui/button";
import Spinner from "../../ui/spinner";
import { routes } from "../../routes";

const createMeetingTokenMutation = gql`
  mutation createMeetingToken($meetingId: String!) {
    createAuthToken(meetingId: $meetingId)
  }
`;

const meetingQuery = gql`
  query getMeetingDetails($id: String!) {
    meeting(id: $id) {
      id
      archived
      attendants {
        list {
          id
          firstName
          lastName
        }
        error
      }
      date
      title
    }
  }
`;

interface AddAttendantProps {
  uuid: string;
}

const MeetingPage: FunctionalComponent<AddAttendantProps> = ({ uuid }) => {
  const { t } = useContext(TranslateContext);

  const [{ data: generatedToken, fetching: fetchingToken }, createMeetingToken] = useMutation<
    CreateMeetingTokenMutation,
    CreateMeetingTokenMutationVariables
  >(createMeetingTokenMutation);

  const [{ data }] = useQuery<GetMeetingDetailsQuery, GetMeetingDetailsQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  const shareLink = generatedToken
    ? (process.env.hostname || "") +
      routes.addattendant(uuid) +
      `?auth=${generatedToken.createAuthToken}`
    : "";

  if (data) {
    const { meeting } = data;
    return (
      <PageContainer>
        <h1>{t("pages.meeting.title", { meeting: meeting.title })}</h1>
        <div>{format(parseISO(meeting.date), process.env.dateFormat)}</div>
        <Link href={routes.addattendant(uuid)}>
          <Button class="mr-2" variant="primary">
            {t("pages.meeting.addAttendant")}
          </Button>
        </Link>

        <Button onClick={() => downloadExport(uuid)} variant="primary">
          {t("pages.meeting.exportMeetingList")}
        </Button>
        <div class="container max-w-xl mb-1 mt-4">{t("pages.meeting.shareExplanation")}</div>
        <div>
          <Button
            disabled={fetchingToken}
            onClick={() => createMeetingToken({ meetingId: uuid })}
            variant="secondary"
          >
            {t("pages.meeting.createShareLink")}{" "}
            {fetchingToken ? <Spinner class="inline-block ml-2 text-white" customColor /> : null}
          </Button>
          {shareLink ? (
            <div>
              <QRCode value={shareLink} />
              <a class="text-blue-700 hover:bg-blue-200 font-bold" href={shareLink}>
                Link
              </a>
            </div>
          ) : null}
        </div>
        <h2 className="h2 mt-8 mb-4">{t("pages.meeting.list")}</h2>
        <table class="-m-2">
          <thead>
            <tr>
              <th class="p-2">{t("entities.attendant.firstName")}</th>
              <th class="p-2">{t("entities.attendant.lastName")}</th>
            </tr>
          </thead>
          <tbody>
            {map(data.meeting.attendants.list, (attendant) => {
              return (
                <tr>
                  <td class="px-2">{attendant.firstName}</td>
                  <td class="px-2">{attendant.lastName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PageContainer>
    );
  }
  return null;
};

export default MeetingPage;
