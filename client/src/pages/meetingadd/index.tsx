import { get } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useMemo } from "preact/hooks";
import { route } from "preact-router";
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
      <h1 className="pb-6">Veranstaltung anlegen</h1>
      <form onSubmit={onSubmit}>
        <div className="container mt-4 max-w-md">
          <Label for="email">Titel</Label>
          <Input
            error={!!errors["title"]}
            placeholder="Gästeraum Vormittag"
            name="title"
            inputRef={register({
              required: "Notwendig",
            })}
            required
            type="text"
          />
          <Label class="mt-4" for="date">
            Datum der Veranstaltung
          </Label>
          <Input
            error={!!errors["date"]}
            name="date"
            inputRef={register({
              required: "Notwendig",
            })}
            required
            type="date"
          />
          <ErrorMessage>{!!errors["date"] ? get(errors["date"], "message") : ""}</ErrorMessage>
          <Button disabled={fetching} type="submit" variant="primary">
            Erstellen
          </Button>
          {fetching ? <Spinner className="inline ml-2" /> : null}
        </div>
      </form>
    </PageContainer>
  );
};

export default MeetingAddPage;
