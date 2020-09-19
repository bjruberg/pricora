import { FunctionalComponent, h } from "preact";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import PageContainer from "../../components/PageContainer";

const meetingsQuery = gql`
  query getMeetings {
    meetings {
      id
    }
  }
`;

const ArrangementsPage: FunctionalComponent = () => {
  const [res] = useQuery({
    query: meetingsQuery,
  });

  console.log(res);

  return (
    <PageContainer>
      <h1>Events</h1>
    </PageContainer>
  );
};

export default ArrangementsPage;
