import { FunctionalComponent, h } from "preact";
import { useContext, useMemo } from "preact/hooks";
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
import { ErrorMessage, SuccessMessage } from "../../ui/message";
import Input from "../../ui/input";
import Spinner from "../../ui/spinner";
import { TranslateContext } from "@denysvuika/preact-translate";

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
  const { t } = useContext(TranslateContext);
  const { errors, handleSubmit, register } = useForm<FormData>();
  const [{ data }] = useQuery<GetMeetingQuery, GetMeetingQueryVariables>({
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  const [{ data: isSaved, error, fetching }, addMeeting] = useMutation<
    AddAttendantMutation,
    AddAttendantMutationVariables
  >(addEntryMutation);

  const onSubmit = useMemo(() => {
    return handleSubmit((entry) => {
      void addMeeting({
        id: uuid,
        input: entry,
      });
    });
  }, [addMeeting, handleSubmit, uuid]);

  const standardRegister = {
    required: t("form.required"),
  };

  if (data) {
    return (
      <PageContainer>
        <h1>{t("pages.addattendant.title", { meeting: data.meeting.title })}</h1>
        <form onSubmit={onSubmit}>
          <div className="container flex mt-4 max-w-md">
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                {t("entities.attendant.firstName")}
              </label>
              <Input
                autoComplete="given-name"
                error={!!errors["firstName"]}
                placeholder={t("entities.attendant.firstNamePlaceholder")}
                name="firstName"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
            <div className="w-2" />
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="lastName">
                {t("entities.attendant.lastName")}
              </label>
              <Input
                autoComplete="family-name"
                error={!!errors["lastName"]}
                placeholder={t("entities.attendant.lastNamePlaceholder")}
                name="lastName"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
          </div>

          <div className="container flex mt-4 max-w-md">
            <div className="w-3/4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="firstName">
                {t("entities.attendant.address")}
              </label>
              <Input
                autoComplete="street-address"
                error={!!errors["address"]}
                placeholder={t("entities.attendant.addressPlaceholder")}
                name="address"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
            <div className="flex-initial w-2" />
            <div className="w-1/4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="lastName">
                {t("entities.attendant.postal")}
              </label>
              <Input
                autoComplete="postal-code"
                error={!!errors["zip"]}
                placeholder={t("entities.attendant.postalPlaceholder")}
                name="zip"
                inputRef={register(standardRegister)}
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
                {t("entities.attendant.city")}
              </label>
              <Input
                autoComplete="address-level2"
                error={!!errors["city"]}
                placeholder={t("entities.attendant.cityPlaceholder")}
                name="city"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
            <div className="flex-initial w-2" />
            <div className="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="country">
                {t("entities.attendant.country")}
              </label>
              <Input
                autoComplete="country"
                error={!!errors["country"]}
                placeholder={t("entities.attendant.countryPlaceholder")}
                name="country"
                inputRef={register(standardRegister)}
                required
                type="text"
                value="Deutschland"
              />
            </div>
          </div>

          <Button disabled={fetching} type="submit" variant="primary">
            {t("actions.add")}
          </Button>
          {error ? (
            <ErrorMessage className="ml-2" inline>
              {t("pages.addattendant.error")}
            </ErrorMessage>
          ) : null}
          {isSaved ? (
            <SuccessMessage className="ml-2" inline>
              {t("pages.addattendant.success")}
            </SuccessMessage>
          ) : null}
          {fetching ? <Spinner className="inline ml-2" /> : null}
        </form>
      </PageContainer>
    );
  }
  return null;
};

export default AddAttendantPage;
