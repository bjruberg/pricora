import { get } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useMemo } from "preact/hooks";
import { useForm } from "react-hook-form";
import gql from "graphql-tag";

import Button from "../../ui/button";
import Input from "../../ui/input";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";
import { useMutation } from "urql";
import { AddMeetingMutation, AddMeetingMutationVariables } from "gql.d";

interface FormData {
  title: string;
}

const AddMeeting = gql`
  mutation addMeeting($meeting: CreateMeetingInput!) {
    createMeeting(input: $meeting) {
      id
    }
  }
`;

const MeetingAddPage: FunctionalComponent = () => {
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [_addedMeeting, addMeeting] = useMutation<AddMeetingMutation, AddMeetingMutationVariables>(
    AddMeeting,
  );

  const onSubmit = useMemo(() => {
    return handleSubmit((d) => {
      void addMeeting({ meeting: d });
    });
  }, [handleSubmit, addMeeting]);

  return (
    <PageContainer>
      <h1 className="pb-6">Veranstaltung anlegen</h1>
      <form onSubmit={onSubmit}>
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Titel
        </label>
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
        <div class="h-4 text-red-700">
          {!!errors["title"] ? get(errors["title"], "message") : ""}
        </div>
        <Button disabled={status === "loading"} type="submit" variant="primary">
          Erstellen
        </Button>
        {status === "loading" ? <Spinner className="inline ml-2" /> : null}
      </form>
    </PageContainer>
  );
};

export default MeetingAddPage;
