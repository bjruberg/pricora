import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import { Link } from "preact-router/match";
import { format, parseISO } from "date-fns";
import addCircleIcon from "../../assets/add_circle.svg";

import { downloadExport } from "./export";

import PageContainer from "../../components/PageContainer";
import { GetMeetingDetailsQuery, GetMeetingDetailsQueryVariables } from "./index.gql";

import Button from "../../ui/button";
import Spinner from "../../ui/spinner";
import { routes } from "../../routes";
import { dateFormat } from "../../constants";
import { useShareLink } from "../../utils/useShareLink";

const meetingQuery = gql`
  query getMeetingDetails($id: String!) {
    meeting(id: $id) {
      id
      archived
      date
      title
    }
  }
`;

interface MeetingPageProps {
  uuid: string;
}

const MeetingPage: FunctionalComponent<MeetingPageProps> = ({ uuid }) => {
  const { t } = useContext(TranslateContext);

  const [{ fetching: fetchingToken }, createMeetingToken, generatedToken] = useShareLink(uuid);

  const [{ data }] = useQuery<GetMeetingDetailsQuery, GetMeetingDetailsQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

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
          </div>
          <Link class="md:justify-self-end" href={routes.addattendant(uuid)}>
            <Button class="mr-2" variant="secondary">
              <img alt="icon" class="inline mb-1 mr-1" src={addCircleIcon} />
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
          <Link href={routes.meetingattendants(uuid)}>
            <Button class="mt-6 w-full" variant="secondary">
              {t("pages.meeting.showAttendants")}
            </Button>
          </Link>
          <Button class="mt-6 w-full" onClick={() => downloadExport(uuid)} variant="secondary">
            {t("pages.meeting.exportAttendantList")}
          </Button>
        </div>
      </PageContainer>
    );
  }
  return null;
};

export default MeetingPage;
