import { get } from "lodash";
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
import { useMutation } from "urql";
import { AddMeetingMutation, AddMeetingMutationVariables } from "./index.gql";
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

const MeetingAddPage: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [{ fetching }, addMeeting] = useMutation<AddMeetingMutation, AddMeetingMutationVariables>(
    AddMeeting,
  );

  const onSubmit = useMemo(() => {
    return handleSubmit((d) => {
      void addMeeting({ meeting: d }).then(() => {
        route(routes.meetinglist);
      });
    });
  }, [handleSubmit, addMeeting]);

  return (
    <PageContainer>
      <h1 className="pb-6">{t("pages.meetingadd.title")}</h1>
      <form onSubmit={onSubmit}>
        <div className="container mt-4 max-w-md">
          <Label for="email">{t("entities.meeting.title")}</Label>
          <Input
            error={!!errors["title"]}
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
            inputRef={register({
              required: t("forms.required"),
            })}
            required
            type="date"
          />
          <ErrorMessage>{!!errors["date"] ? get(errors["date"], "message") : ""}</ErrorMessage>
          <Button disabled={fetching} type="submit" variant="primary">
            {t("actions.create")}
          </Button>
          {fetching ? <Spinner className="inline ml-2" /> : null}
        </div>
      </form>
    </PageContainer>
  );
};

export default MeetingAddPage;
