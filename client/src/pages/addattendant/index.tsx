import { FunctionalComponent, h } from "preact";
import { useMemo } from "preact/hooks";
import { useQuery, useMutation } from "@urql/preact";
import gql from "graphql-tag";
import { useForm } from "react-hook-form";

import PageContainer from "../../components/PageContainer";
import {
  AddAttendantMutation,
  AddAttendantMutationVariables,
  GetMeetingQuery,
  GetMeetingQueryVariables,
} from "./index.gql";

import Button from "../../ui/button";
import { ErrorMessage } from "../../ui/message";
import Input from "../../ui/input";
import Spinner from "../../ui/spinner";

const meetingQuery = gql`
  query getMeeting($id: String!) {
    meeting(id: $id) {
      id
      archived
      title
    }
  }
`;

const addEntryMutation = gql`
  mutation addAttendant($id: String!, $input: EntryInput!) {
    addAttendant(meeting: $id, input: $input)
  }
`;

interface FormData {
  address: string;
  country: string;
  firstName: string;
  lastName: string;
  city: string;
  zip: string;
}

interface AddAttendantProps {
  uuid: string;
}

const AddAttendantPage: FunctionalComponent<AddAttendantProps> = ({ uuid }) => {
  const { errors, handleSubmit, register } = useForm<FormData>();
  const [{ data }] = useQuery<GetMeetingQuery, GetMeetingQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  const [, addMeeting] = useMutation<AddAttendantMutation, AddAttendantMutationVariables>(
    addEntryMutation,
  );

  const onSubmit = useMemo(() => {
    return handleSubmit((entry) => {
      void addMeeting({
        id: uuid,
        input: entry,
      });
    });
  }, [addMeeting, handleSubmit, uuid]);

  if (data) {
    return (
      <PageContainer>
        <h1>Eintragen für {data.meeting.title}</h1>
        <form onSubmit={onSubmit}>
          <div className="container flex mt-4 max-w-md">
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                Vorname
              </label>
              <Input
                autoComplete="given-name"
                error={!!errors["firstName"]}
                placeholder="Max"
                name="firstName"
                inputRef={register({
                  required: "Notwendig",
                })}
                required
                type="text"
              />
            </div>
            <div className="w-2" />
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="lastName">
                Nachname
              </label>
              <Input
                autoComplete="family-name"
                error={!!errors["lastName"]}
                placeholder="Muster"
                name="lastName"
                inputRef={register({
                  required: "Notwendig",
                })}
                required
                type="text"
              />
            </div>
          </div>

          <div className="container flex mt-4 max-w-md">
            <div className="w-3/4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                Straße
              </label>
              <Input
                autoComplete="street-address"
                error={!!errors["address"]}
                placeholder="Hauptstraße 33"
                name="address"
                inputRef={register({
                  required: "Notwendig",
                })}
                required
                type="text"
              />
            </div>
            <div className="flex-initial w-2" />
            <div className="w-1/4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="lastName">
                PLZ
              </label>
              <Input
                autoComplete="postal-code"
                error={!!errors["zip"]}
                placeholder="13222"
                name="zip"
                inputRef={register({
                  required: "Notwendig",
                })}
                maxLength={6}
                required
                size={6}
                type="text"
              />
            </div>
          </div>

          <div className="container flex mt-4 max-w-md">
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="city">
                City
              </label>
              <Input
                autoComplete="address-level2"
                error={!!errors["city"]}
                placeholder="Berlin"
                name="city"
                inputRef={register({
                  required: "Notwendig",
                })}
                required
                type="text"
              />
            </div>
            <div className="flex-initial w-2" />
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="country">
                Land
              </label>
              <Input
                autoComplete="country"
                error={!!errors["country"]}
                placeholder="Deutschland"
                name="country"
                inputRef={register({
                  required: "Notwendig",
                })}
                required
                type="text"
                value="Deutschland"
              />
            </div>
          </div>

          <Button disabled={status === "loading"} type="submit" variant="primary">
            Eintragen
          </Button>
          {status === "loading" ? <Spinner className="inline ml-2" /> : null}
        </form>
      </PageContainer>
    );
  }
  return null;
};

export default AddAttendantPage;
