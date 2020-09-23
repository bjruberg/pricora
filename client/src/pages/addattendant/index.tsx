import { FunctionalComponent, h } from "preact";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import PageContainer from "../../components/PageContainer";
import { GetMeetingQuery, GetMeetingQueryVariables } from "./index.gql";

const meetingQuery = gql`
  query getMeeting($id: String!) {
    meeting(id: $id) {
      id
      archived
      title
    }
  }
`;

const AddAttendantPage: FunctionalComponent = () => {
  const [{ data }] = useQuery<GetMeetingQuery, GetMeetingQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
  });

  if (data) {
    return (
      <PageContainer>
        <h1>Eintragen für {data.meeting.title}</h1>
      </PageContainer>
    );
  }
  return null;
};

export default AddAttendantPage;
