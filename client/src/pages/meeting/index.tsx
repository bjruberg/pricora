import { FunctionalComponent, h } from "preact";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import { map } from "lodash";
import { Link } from "preact-router/match";

import PageContainer from "../../components/PageContainer";
import { GetMeetingDetailsQuery, GetMeetingDetailsQueryVariables } from "./index.gql";

import Button from "../../ui/button";

import { routes } from "../../routes";

const meetingQuery = gql`
  query getMeetingDetails($id: String!) {
    meeting(id: $id) {
      id
      archived
      attendants {
        id
        firstName
        lastName
      }
      title
    }
  }
`;

interface AddAttendantProps {
  uuid: string;
}

const MeetingPage: FunctionalComponent<AddAttendantProps> = ({ uuid }) => {
  const [{ data }] = useQuery<GetMeetingDetailsQuery, GetMeetingDetailsQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  if (data) {
    return (
      <PageContainer>
        <h1>Details zu {data.meeting.title}</h1>
        <Link href={routes.addattendant(uuid)}>
          <Button variant="primary">Teilnehmer hinzufügen</Button>
        </Link>
        <h2 className="h2 mt-8 mb-4">Teilnehmerliste</h2>
        <table class="-m-2">
          <thead>
            <tr>
              <th class="p-2">Vorname</th>
              <th class="p-2">Nachname</th>
            </tr>
          </thead>
          <tbody>
            {map(data.meeting.attendants, (attendant) => {
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
