import { FunctionalComponent, h } from "preact";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import PageContainer from "../../components/PageContainer";
import { GetMeetingsQuery, GetMeetingsQueryVariables } from "./index.gql";

const meetingsQuery = gql`
  query getMeetings {
    meetings {
      id
      archived
      title
    }
  }
`;

const ArrangementsPage: FunctionalComponent = () => {
  const [{ data }] = useQuery<GetMeetingsQuery, GetMeetingsQueryVariables>({
    query: meetingsQuery,
  });

  return (
    <PageContainer>
      <h1>Veranstaltungen</h1>
      <ul>
        {data?.meetings.map((meeting) => {
          return (
            <li key={meeting.id}>
              {meeting.title}: {meeting.archived}
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
};

export default ArrangementsPage;
