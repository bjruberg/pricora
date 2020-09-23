import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import PageContainer from "../../components/PageContainer";
import { GetMeetingsQuery, GetMeetingsQueryVariables } from "./index.gql";
import { routes } from "../../routes";

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
    requestPolicy: "cache-and-network",
  });

  return (
    <PageContainer>
      <h1>Veranstaltungen</h1>
      <ul>
        {data?.meetings.map((meeting) => {
          return (
            <li>
              <Link href={routes.addattendant(meeting.id)} key={meeting.id}>
                {meeting.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
};

export default ArrangementsPage;
