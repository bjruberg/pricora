import { Fragment, FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import { useQuery } from "@urql/preact";
import gql from "graphql-tag";
import { groupBy, keys, map, orderBy, partition } from "lodash";
import { format, parseISO } from "date-fns";
import PageContainer from "../../components/PageContainer";
import Button from "../../ui/button";
import { GetMeetingsQuery, GetMeetingsQueryVariables } from "./index.gql";
import { Card } from "../../components/Card";
import { routes } from "../../routes";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext, useMemo } from "preact/hooks";

import { dateFormat } from "../../constants";

const meetingsQuery = gql`
  query getMeetings {
    meetings {
      id
      date
      archived
      user {
        id
        firstName
        lastName
      }
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

  const dayGroupedMeetings = useMemo(() => {
    return groupBy(data?.meetings, "date");
  }, [data?.meetings]);

  const now = new Date().setHours(0, 0, 0, 0).valueOf();
  const [after, before] = partition(keys(dayGroupedMeetings), (day) => {
    return new Date(day).valueOf() > now;
  });

  console.log({ before, after });

  const renderDay = (day: string) => {
    const meetings = dayGroupedMeetings[day];
    return (
      <li>
        <strong class="text-gray-600">{format(parseISO(day), dateFormat)}</strong>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {map(meetings, (meeting) => {
            return (
              <Card
                header={
                  <Fragment>
                    <Link href={routes.meeting(meeting.id)} key={meeting.id}>
                      {meeting.title}
                    </Link>
                  </Fragment>
                }
              >
                {t("pages.meetinglist.owner")}: {meeting.user.firstName} {meeting.user.lastName}
              </Card>
            );
          })}
        </div>
      </li>
    );
  };

  return (
    <PageContainer>
      <div class="grid grid-cols-1 md:grid-cols-2 mb-2">
        <h1>{t("pages.meetinglist.title")}</h1>
        <Link class="md:justify-self-end" href={routes.meetingadd}>
          <Button variant="secondary">{t("navigation.addMeeting")}</Button>
        </Link>
      </div>
      <ul>{map(orderBy(after), renderDay)}</ul>
      <ul>{map(orderBy(before), renderDay)}</ul>
    </PageContainer>
  );
};

export default ArrangementsPage;
