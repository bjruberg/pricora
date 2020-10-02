import { Fragment, FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import { format, parseISO } from "date-fns";
import PageContainer from "../../components/PageContainer";
import Button from "../../ui/button";
import { GetMeetingsQuery, GetMeetingsQueryVariables } from "./index.gql";
import { Card } from "../../components/Card";
import { routes } from "../../routes";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";

import { dateFormat } from "../../constants";

const meetingsQuery = gql`
  query getMeetings {
    meetings {
      id
      date
      archived
      title
    }
  }
`;

const ArrangementsPage: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  const [{ data }] = useQuery<GetMeetingsQuery, GetMeetingsQueryVariables>({
    query: meetingsQuery,
    requestPolicy: "cache-and-network",
  });

  return (
    <PageContainer>
      <div class="grid grid-cols-1 md:grid-cols-2 ">
        <h1>{t("pages.meetinglist.title")}</h1>
        <Link class="md:justify-self-end" href={routes.meetingadd}>
          <Button variant="secondary">{t("navigation.addMeeting")}</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {data?.meetings.map((meeting) => {
          return (
            <Card
              header={
                <Fragment>
                  <Link href={routes.meeting(meeting.id)} key={meeting.id}>
                    {meeting.title}
                  </Link>
                  <span class="float-right text-gray-600">
                    {format(parseISO(meeting.date), dateFormat)}
                  </span>
                </Fragment>
              }
            />
          );
        })}
      </div>
    </PageContainer>
  );
};

export default ArrangementsPage;
