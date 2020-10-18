import { Fragment, FunctionalComponent, h } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { useQuery, useMutation } from "@urql/preact";
import { Link } from "preact-router/match";
import { format, parseISO } from "date-fns";
import gql from "graphql-tag";
import { get } from "lodash";
import { useForm } from "react-hook-form";
import * as EmailValidator from "email-validator";

import Breadcrumbs from "../../components/Breadcrumbs";
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
import { dateFormat, defaultCountry } from "../../constants";
import { routes } from "../../routes";

const meetingQuery = gql`
  query getMeeting($id: String!) {
    meeting(id: $id) {
      id
      archived
      date
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
  city: string;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  random: string;
  zip: string;
}

interface AddAttendantProps {
  matches: Record<string, string>;
  uuid: string;
}

const AddAttendantPage: FunctionalComponent<AddAttendantProps> = ({ matches, uuid }) => {
  const urqlContext = useMemo(() => {
    return {
      url: `${get(process.env, "hostname", "")}/graphql${
        matches.auth ? `?auth=${matches.auth}` : ""
      }`,
    };
  }, [matches.auth]);

  const { t } = useContext(TranslateContext);
  const {
    errors,
    formState: { isDirty, submitCount },
    handleSubmit,
    register,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      country: defaultCountry,
    },
  });

  const [{ data, error: fetchMeetingError }] = useQuery<GetMeetingQuery, GetMeetingQueryVariables>({
    context: urqlContext,
    query: meetingQuery,
    requestPolicy: "cache-and-network",
    variables: { id: uuid },
  });

  const isUnauthorized = get(fetchMeetingError, "response.status") === 401;

  const [{ data: isSaved, error: additionError, fetching }, addMeeting] = useMutation<
    AddAttendantMutation,
    AddAttendantMutationVariables
  >(addEntryMutation);

  const onSubmit = useMemo(() => {
    return handleSubmit((entry) => {
      void addMeeting(
        {
          id: uuid,
          input: entry,
        },
        urqlContext,
      ).then(() => {
        reset(entry, {
          isDirty: false,
          isValid: true,
          dirtyFields: false, // dirtyFields will be reset
          errors: true, // anything with true will not be reset
          isSubmitted: true,
          touched: false,
          submitCount: true,
        });
      });
    });
  }, [addMeeting, urqlContext, handleSubmit, reset, uuid]);

  const requiredRegister = {
    required: t("forms.required"),
  };

  const crumbs = (
    <Breadcrumbs>
      <Link href={routes.meeting(uuid)}>{data?.meeting.title}</Link>
      <Link aria-current="page" href={routes.addattendant(uuid)}>
        {t("navigation.addAttendant")}
      </Link>
    </Breadcrumbs>
  );

  //
  // console.log(routes.meetinglist);

  if (data) {
    return (
      <Fragment>
        {crumbs}
        <PageContainer>
          <h1 className="mb-3">
            {t("pages.addattendant.title", {
              meeting: data.meeting.title,
              on: format(parseISO(data.meeting.date), dateFormat),
            })}
          </h1>
          {t("pages.addattendant.disclaimer")}
          <form onSubmit={onSubmit}>
            <div className="container flex mt-3 max-w-md">
              <div className="flex-1">
                <Label for="email">{t("entities.attendant.email")}*</Label>
                <Input
                  autoComplete="email"
                  error={!!errors["email"]}
                  id="email"
                  placeholder="me@server.com"
                  name="email"
                  inputRef={register({
                    validate: {
                      email: (val) => (EmailValidator.validate(val) ? true : t("forms.email")),
                    },
                    required: t("forms.required"),
                  })}
                  type="email"
                />
              </div>
              <div className="w-2" />
              <div className="flex-1">
                <Label for="phone">{t("entities.attendant.phone")}*</Label>
                <Input
                  autoComplete="tel"
                  id="phone"
                  error={!!errors["phone"]}
                  placeholder="555 51234567"
                  name="phone"
                  inputRef={register(requiredRegister)}
                  type="tel"
                />
              </div>
            </div>
            <div className="container flex mt-4 max-w-md">
              <div className="flex-1">
                <Label for="firstName">{t("entities.attendant.firstName")}</Label>
                <Input
                  autoComplete="given-name"
                  error={!!errors["firstName"]}
                  id="firstName"
                  placeholder={t("entities.attendant.firstNamePlaceholder")}
                  name="firstName"
                  inputRef={register()}
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
                  inputRef={register()}
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
                  inputRef={register()}
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
                  inputRef={register()}
                  maxLength={6}
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
                  inputRef={register()}
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
                  inputRef={register()}
                  type="text"
                />
              </div>
            </div>

            <div className="container mt-4 max-w-md">
              <Label for="random">{t("entities.attendant.random")}</Label>
              <textarea
                class="shadow border block w-full"
                id="random"
                name="random"
                ref={register()}
              ></textarea>
            </div>
            <div className="max-w-md mt-6">
              <div className="inline-grid grid-cols-3 mb-2 w-full">
                <span class="col-span-2">
                  <Button
                    class="mr-2"
                    disabled={fetching || (submitCount > 0 && !isDirty)}
                    type="submit"
                    variant="primary"
                  >
                    {t("actions.add")}
                  </Button>
                  {fetching ? <Spinner className="inline ml-2" /> : null}
                </span>
                <Button
                  disabled={!(submitCount > 0 && !isDirty)}
                  onClick={() => {
                    reset({});
                  }}
                  type="button"
                  variant="secondary"
                >
                  {t("actions.clear")}
                </Button>
              </div>
              <div>
                {additionError ? (
                  <ErrorMessage inline>{t("pages.addattendant.error")}</ErrorMessage>
                ) : null}
                {isSaved ? (
                  <SuccessMessage inline>{t("pages.addattendant.success")}</SuccessMessage>
                ) : null}
              </div>
            </div>
          </form>
        </PageContainer>
      </Fragment>
    );
  }

  if (isUnauthorized) {
    return (
      <Fragment>
        {crumbs}
        <PageContainer>
          <ErrorMessage>{t("pages.addattendant.unauthorized")}</ErrorMessage>
        </PageContainer>
      </Fragment>
    );
  }
  return null;
};

export default AddAttendantPage;
