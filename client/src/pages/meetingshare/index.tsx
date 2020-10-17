import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import { useQuery } from "@urql/preact";

import gql from "graphql-tag";
import QRCode from "qrcode.react";

import PageContainer from "../../components/PageContainer";
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
      <h1 className="mb-2">
        {t("pages.meetingshare.title")}: <strong>{data.meeting.title}</strong>
      </h1>
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
