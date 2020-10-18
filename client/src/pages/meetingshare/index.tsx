import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useCallback, useContext } from "preact/hooks";
import { useQuery } from "@urql/preact";

import gql from "graphql-tag";
import QRCode from "qrcode.react";

import PageContainer from "../../components/PageContainer";
import Button from "../../ui/button";
import { useShareLink } from "../../utils/useShareLink";
import useInterval from "../../utils/useInterval";
import { GetMeetingShareQuery, GetMeetingShareQueryVariables } from "./index.gql";

const meetingQuery = gql`
  query getMeetingShare($id: String!) {
    meeting(id: $id) {
      id
      archived
      date
      title
    }
  }
`;

interface MeetingShareProps {
  uuid: string;
}

const MeetingSharePage: FunctionalComponent<MeetingShareProps> = ({ uuid }) => {
  const { t } = useContext(TranslateContext);

  const [, generateToken, shareLink] = useShareLink(uuid);
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      }
    }
  }, []);

  useInterval(() => {
    void generateToken({ meetingId: uuid });
  }, 1000 * 60 * 30);

  const [{ data }] = useQuery<GetMeetingShareQuery, GetMeetingShareQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  return data ? (
    <PageContainer>
      <div class="grid grid-cols-1 md:grid-cols-2 mb-2">
        <h1 className="mb-2">
          {t("pages.meetingshare.title")}: <strong>{data.meeting.title}</strong>
        </h1>
        <div className="md:justify-self-end">
          <Button onClick={toggleFullScreen} slim variant="secondary">
            {t("pages.meetingshare.toggleFullScreen")}
          </Button>
        </div>
      </div>
      {shareLink ? (
        <div className="mt-4 flex flex-col items-center">
          <QRCode className="m-2 mb-4" size={300} value={shareLink} />
          <em>{t("pages.meetingshare.validityExp")}</em>
        </div>
      ) : null}
    </PageContainer>
  ) : null;
};

export default MeetingSharePage;
