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
import { Label } from "../../ui/label";
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
    required: t("forms.required"),
  };

  if (data) {
    return (
      <PageContainer>
        <h1>{t("pages.addattendant.title", { meeting: data.meeting.title })}</h1>
        <form onSubmit={onSubmit}>
          <div className="container flex mt-4 max-w-md">
            <div className="flex-1">
              <Label for="firstName">{t("entities.attendant.firstName")}</Label>
              <Input
                autoComplete="given-name"
                error={!!errors["firstName"]}
                id="firstName"
                placeholder={t("entities.attendant.firstNamePlaceholder")}
                name="firstName"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
            <div className="w-2" />
            <div className="flex-1">
              <Label for="lastName">{t("entities.attendant.lastName")}</Label>
              <Input
                autoComplete="family-name"
                id="lastName"
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
              <Label for="title">{t("entities.attendant.address")}</Label>
              <Input
                autoComplete="street-address"
                error={!!errors["address"]}
                id="address"
                placeholder={t("entities.attendant.addressPlaceholder")}
                name="address"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
            <div className="flex-initial w-2" />
            <div className="w-1/4">
              <Label for="zip">{t("entities.attendant.postal")}</Label>
              <Input
                autoComplete="postal-code"
                error={!!errors["zip"]}
                id="zip"
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
              <Label for="city">{t("entities.attendant.city")}</Label>
              <Input
                autoComplete="address-level2"
                error={!!errors["city"]}
                id="city"
                placeholder={t("entities.attendant.cityPlaceholder")}
                name="city"
                inputRef={register(standardRegister)}
                required
                type="text"
              />
            </div>
            <div className="flex-initial w-2" />
            <div className="flex-1">
              <Label for="country">{t("entities.attendant.country")}</Label>
              <Input
                autoComplete="country"
                error={!!errors["country"]}
                id="country"
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
