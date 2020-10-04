import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import { useQuery } from "@urql/preact";
import { format, parseISO } from "date-fns";
import gql from "graphql-tag";
import { map } from "lodash";
import { ErrorMessage } from "../../ui/message";
import PageContainer from "../../components/PageContainer";
import {
  GetMeetingDetailsAttendantsQuery,
  GetMeetingDetailsAttendantsQueryVariables,
} from "./index.gql";
import { dateFormat } from "../../constants";

const meetingQuery = gql`
  query getMeetingDetailsAttendants($id: String!) {
    meeting(id: $id) {
      id
      attendants {
        list {
          created
          id
          email
          firstName
          lastName
          phone
        }
        error
      }
      date
      title
    }
  }
`;

interface MeetingAttendantsProps {
  uuid: string;
}

const MeetingAttendantsPage: FunctionalComponent<MeetingAttendantsProps> = ({ uuid }) => {
  const { t } = useContext(TranslateContext);

  const [{ data }] = useQuery<
    GetMeetingDetailsAttendantsQuery,
    GetMeetingDetailsAttendantsQueryVariables
  >({
    pollInterval: 30000,
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  if (data) {
    const { meeting } = data;
    return (
      <PageContainer>
        <h1 className="mb-2">
          {t("pages.meetingattendants.title")}: <strong>{meeting.title}</strong>
        </h1>
        <em>{t("pages.meetingattendants.explanation")}</em>
        {meeting.attendants.error ? (
          <ErrorMessage>{t("pages.meetingattendants.decryptionError")}</ErrorMessage>
        ) : (
          <table class="mt-2">
            <thead>
              <tr>
                <th class="p-2">{t("entities.created")}</th>
                <th class="p-2">{t("entities.attendant.firstName")}</th>
                <th class="p-2">{t("entities.attendant.lastName")}</th>
                <th class="p-2">{t("entities.attendant.email")}</th>
                <th class="p-2">{t("entities.attendant.phone")}</th>
              </tr>
            </thead>
            <tbody>
              {map(meeting.attendants.list, (attendant) => {
                const d = parseISO(attendant.created);
                return (
                  <tr>
                    <td class="px-2">
                      {format(d, dateFormat)} {format(d, "HH:mm")}
                    </td>
                    <td class="px-2">{attendant.firstName}</td>
                    <td class="px-2">{attendant.lastName}</td>
                    <td class="px-2">{attendant.email}</td>
                    <td class="px-2">{attendant.phone}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </PageContainer>
    );
  }
  return null;
};

export default MeetingAttendantsPage;
