import { format } from "date-fns";
import { get, map } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { route } from "preact-router";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useForm } from "react-hook-form";
import gql from "graphql-tag";

import Button from "../../ui/button";
import Input from "../../ui/input";
import { Label } from "../../ui/label";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";
import { useMutation, useQuery } from "urql";
import {
  AddMeetingMutation,
  AddMeetingMutationVariables,
  GetUnlockedAdminsQuery,
  GetUnlockedAdminsQueryVariables,
} from "./index.gql";
import { ErrorMessage } from "../../ui/message";
import { routes } from "../../routes";

interface FormData {
  date: string;
  title: string;
}

const AddMeeting = gql`
  mutation addMeeting($meeting: MeetingInput!) {
    createMeeting(input: $meeting) {
      id
    }
  }
`;

const unlockedAdminsQuery = gql`
  query getUnlockedAdmins {
    unlockedAdmins {
      id
      firstName
      lastName
    }
  }
`;

const MeetingAddPage: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [{ error, fetching }, addMeeting] = useMutation<
    AddMeetingMutation,
    AddMeetingMutationVariables
  >(AddMeeting);

  const [{ data: unlockedAdmins }] = useQuery<
    GetUnlockedAdminsQuery,
    GetUnlockedAdminsQueryVariables
  >({
    query: unlockedAdminsQuery,
    requestPolicy: "cache-and-network",
  });

  const onSubmit = useMemo(() => {
    return handleSubmit((d) => {
      void addMeeting({ meeting: d }).then((res) => {
        if (res.data) {
          route(routes.meeting(res.data.createMeeting.id));
        }
      });
    });
  }, [handleSubmit, addMeeting]);

  return (
    <PageContainer>
      <h1>{t("pages.meetingadd.title")}</h1>
      <form onSubmit={onSubmit}>
        <div className="container mt-4 max-w-md">
          <Label for="title">{t("entities.meeting.title")}</Label>
          <Input
            error={!!errors["title"]}
            id="title"
            placeholder={t("entities.meeting.titlePlaceholder")}
            name="title"
            inputRef={register({
              required: t("forms.required"),
            })}
            required
            type="text"
          />
          <Label class="mt-4" for="date">
            {t("entities.meeting.date")}
          </Label>
          <Input
            error={!!errors["date"]}
            name="date"
            id="date"
            inputRef={register({
              required: t("forms.required"),
            })}
            min={format(new Date(), "yyyy-MM-dd")}
            required
            type="date"
          />
          <ErrorMessage>{!!errors["date"] ? get(errors["date"], "message") : ""}</ErrorMessage>
          <Button class="mt-6 mr-2 mb-2" disabled={fetching} type="submit" variant="primary">
            {t("actions.create")}
          </Button>
          {fetching ? <Spinner className="inline ml-2" /> : null}
          {!!error ? <ErrorMessage>{t("pages.meetingadd.error")}</ErrorMessage> : ""}
        </div>
      </form>
      <div className="text-xs">{t("pages.meetingadd.unlockedAdmins")}</div>
      <ul>
        {unlockedAdmins?.unlockedAdmins.length > 0
          ? map(unlockedAdmins?.unlockedAdmins, (admin) => {
              return (
                <li className="text-blue-800 text-xs">
                  {admin?.firstName} {admin?.lastName}
                </li>
              );
            })
          : t("pages.meetingadd.none")}
      </ul>
    </PageContainer>
  );
};

export default MeetingAddPage;
