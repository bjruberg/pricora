import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import { useQuery, useMutation } from "@urql/preact";
import gql from "graphql-tag";
import { route } from "preact-router";
import { Link } from "preact-router/match";
import { format, parseISO } from "date-fns";
import addCircleIcon from "../../assets/add_circle.svg";

import { downloadExport } from "./export";

import PageContainer from "../../components/PageContainer";
import {
  DeleteMeetingMutation,
  DeleteMeetingMutationVariables,
  GetMeetingDetailsQuery,
  GetMeetingDetailsQueryVariables,
} from "./index.gql";

import Button from "../../ui/button";
import Spinner from "../../ui/spinner";
import { routes } from "../../routes";
import { dateFormat } from "../../constants";
import { useShareLink } from "../../utils/useShareLink";
import { useToggle } from "../../utils/useToggle";
import { UserContext } from "../../contexts/user";

const meetingQuery = gql`
  query getMeetingDetails($id: String!) {
    meeting(id: $id) {
      id
      archived
      date
      title
      user {
        id
        firstName
        lastName
        isAdmin
      }
    }
  }
`;

const deleteMeetingMutation = gql`
  mutation deleteMeeting($id: String!) {
    deleteMeeting(meeting: $id)
  }
`;

interface MeetingPageProps {
  uuid: string;
}

const MeetingPage: FunctionalComponent<MeetingPageProps> = ({ uuid }) => {
  const { t } = useContext(TranslateContext);
  const { user } = useContext(UserContext);
  const [showRealDeleteButton, toggleShowRealDeleteButton] = useToggle(false);

  const [{ fetching: fetchingToken }, createMeetingToken, generatedToken] = useShareLink(uuid);

  const [{ data }] = useQuery<GetMeetingDetailsQuery, GetMeetingDetailsQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  const [, deleteMeeting] = useMutation<DeleteMeetingMutation, DeleteMeetingMutationVariables>(
    deleteMeetingMutation,
  );

  if (data) {
    const { meeting } = data;
    return (
      <PageContainer>
        <div class="grid grid-cols-1 md:grid-cols-2 mb-2 ">
          <div>
            <h1>
              {t("pages.meeting.title")}: <strong>{meeting.title}</strong>
            </h1>
            <div className="mb-2">
              {t("pages.meeting.date")}: {format(parseISO(meeting.date), dateFormat)}
            </div>
            <div>
              {t("pages.meeting.owner")}: {meeting.user.firstName} {meeting.user.lastName}
            </div>
          </div>
          <Link class="md:justify-self-end" href={routes.addattendant(uuid)}>
            <Button class="mr-2" variant="secondary">
              <img alt="" class="inline mb-1 mr-1" role="presentation" src={addCircleIcon} />
              {t("pages.meeting.addAttendant")}
            </Button>
          </Link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
          <Button
            disabled={fetchingToken}
            onClick={() => createMeetingToken({ meetingId: uuid })}
            variant="primary"
          >
            {t("pages.meeting.createShareLink")}{" "}
            {fetchingToken ? <Spinner class="inline-block ml-2 text-white" customColor /> : null}
          </Button>
          <Link href={routes.meetingshare(uuid)}>
            <Button class="w-full" variant="primary">
              {t("pages.meeting.showQR")}
            </Button>
          </Link>
          {generatedToken ? (
            <div>
              <a class="text-blue-700 hover:bg-blue-200 font-bold" href={generatedToken}>
                Link
              </a>
            </div>
          ) : null}
        </div>
        <div class="container max-w-md mt-4">{t("pages.meeting.shareExplanation")}</div>

        <h2 className="mt-6">{t("pages.meeting.attendants")}</h2>
        {meeting.user.userId === user?.id || meeting.user.isAdmin ? (
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
            <Link href={routes.meetingattendants(uuid)}>
              <Button class="mt-6 w-full" variant="secondary">
                {t("pages.meeting.showAttendants")}
              </Button>
            </Link>
            <Button class="mt-6 w-full" onClick={() => downloadExport(uuid)} variant="secondary">
              {t("pages.meeting.exportAttendantList")}
            </Button>
            <Button onClick={toggleShowRealDeleteButton} variant="dangerous">
              {t("pages.meeting.deleteMeeting")}
            </Button>
            {showRealDeleteButton ? (
              <Button
                onClick={() => deleteMeeting({ id: uuid }).then(() => route(routes.meetinglist))}
                variant="dangerous"
              >
                {t("pages.meeting.finalDeleteMeeting")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </PageContainer>
    );
  }
  return null;
};

export default MeetingPage;
