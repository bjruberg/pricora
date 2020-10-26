import { Fragment, FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import { useQuery, useMutation } from "@urql/preact";
import gql from "graphql-tag";
import { route } from "preact-router";
import { Link } from "preact-router/match";
import { format, parseISO } from "date-fns";
import addCircleIcon from "../../assets/add_circle.svg";

import { downloadExport } from "./export";
import Breadcrubms from "../../components/Breadcrumbs";
import PageContainer from "../../components/PageContainer";
import {
  DeleteMeetingMutation,
  DeleteMeetingMutationVariables,
  GetMeetingDetailsQuery,
  GetMeetingDetailsQueryVariables,
} from "./index.gql";

import Button from "../../ui/button";
import Input from "../../ui/input";
import { NotifiyMessage } from "../../ui/message";
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
      canDecrypt
      date
      title
      user {
        id
        firstName
        lastName
        isAdmin
      }
    }

    me {
      keyIsAvailable
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
    const { meeting, me } = data;
    return (
      <Fragment>
        <Breadcrubms>
          <Link aria-current="page" href={routes.meeting(uuid)}>
            {meeting.title}
          </Link>
        </Breadcrubms>
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
          </div>
          <div class="container max-w-lg mt-4">
            {t("pages.meeting.shareExplanation")}
            {generatedToken ? <Input className="w-full" readOnly value={generatedToken} /> : null}
          </div>

          <h2 className="mt-6">{t("pages.meeting.attendants")}</h2>
          {(() => {
            if (!me.keyIsAvailable) {
              return <NotifiyMessage>{t("pages.meeting.needToLogin")}</NotifiyMessage>;
            }

            if (meeting.canDecrypt) {
              return (
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
                  <Link href={routes.meetingattendants(uuid)}>
                    <Button class="mt-6 w-full" variant="secondary">
                      {t("pages.meeting.showAttendants")}
                    </Button>
                  </Link>
                  <Button
                    class="mt-6 w-full"
                    onClick={() => downloadExport(uuid)}
                    variant="secondary"
                  >
                    {t("pages.meeting.exportAttendantList")}
                  </Button>
                  <Button onClick={toggleShowRealDeleteButton} variant="dangerous">
                    {t("pages.meeting.deleteMeeting")}
                  </Button>
                  {showRealDeleteButton ? (
                    <Button
                      onClick={() =>
                        deleteMeeting({ id: uuid }).then(() => route(routes.meetinglist))
                      }
                      variant="dangerous"
                    >
                      {t("pages.meeting.finalDeleteMeeting")}
                    </Button>
                  ) : null}
                </div>
              );
            }

            return <NotifiyMessage>{t("pages.meeting.noCommonSecret")}</NotifiyMessage>;
          })()}
          {}
        </PageContainer>
      </Fragment>
    );
  }
  return null;
};

export default MeetingPage;
