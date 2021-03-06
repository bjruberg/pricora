import { get } from "lodash";
import { Fragment, FunctionalComponent, h } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { Link } from "preact-router/match";
import { useForm } from "react-hook-form";
import { useMutation } from "@urql/preact";
import gql from "graphql-tag";

import { UserContext } from "../../contexts/user";
import Button from "../../ui/button";
import { ErrorMessage, SuccessMessage } from "../../ui/message";
import { Label } from "../../ui/label";
import Spinner from "../../ui/spinner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import PageContainer from "../../components/PageContainer";
import PasswordInput from "../../components/PasswordInput";
import { routes } from "../../routes";

import { ChangePasswordMutation, ChangePasswordMutationVariables } from "./index.gql";

import { TranslateContext } from "@denysvuika/preact-translate";

interface FormData {
  currentPassword: string;
  newPassword: string;
}

interface LoginPageProps {
  refetchUser: () => Promise<unknown>;
}

const changePasswordMutation = gql`
  mutation changePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

const AccountPage: FunctionalComponent<LoginPageProps> = () => {
  const { t } = useContext(TranslateContext);
  const { refetchUser, user } = useContext(UserContext);
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [{ data: isChanged, error, fetching }, changePassword] = useMutation<
    ChangePasswordMutation,
    ChangePasswordMutationVariables
  >(changePasswordMutation);

  const onSubmit = useMemo(() => {
    return handleSubmit((formData) => {
      void changePassword(formData).then(() => refetchUser());
    });
  }, [changePassword, handleSubmit, refetchUser]);

  return (
    <Fragment>
      <Breadcrumbs>
        <Link aria-current="page" href={routes.account}>
          {t("navigation.account")}
        </Link>
      </Breadcrumbs>
      <PageContainer>
        <h1 className="pb-6">
          {t("pages.account.title", { name: `${user?.firstName || ""} ${user?.lastName || ""}` })}
        </h1>
        <div class="container">
          <Card header={t("pages.account.changePassword")}>
            <form onSubmit={onSubmit}>
              <div className="container mt-4 max-w-md">
                <Label className="mt-4" for="currentPassword">
                  {t("pages.account.oldPassword")}
                </Label>
                <PasswordInput
                  autocomplete="current-password"
                  error={!!errors["currentPassword"]}
                  id="currentPassword"
                  placeholder="*****"
                  inputRef={register({
                    required: t("forms.required"),
                  })}
                  name="currentPassword"
                />
                <ErrorMessage>
                  {!!errors["currentPassword"] ? get(errors["currentPassword"], "message") : ""}
                </ErrorMessage>
                <Label className="mt-4" for="newPassword">
                  {t("pages.account.newPassword")}
                </Label>
                <PasswordInput
                  autocomplete="new-password"
                  error={!!errors["newPassword"]}
                  id="newPassword"
                  placeholder="*****"
                  inputRef={register({
                    minLength: { value: 8, message: t("forms.atLeast", { count: 8 }) },
                    required: t("forms.required"),
                  })}
                  name="newPassword"
                />
                <ErrorMessage>
                  {!!errors["newPassword"] ? get(errors["newPassword"], "message") : ""}
                </ErrorMessage>
              </div>
              <Button className="mt-4" disabled={fetching} type="submit" variant="primary">
                {t("actions.submit")}
              </Button>
              {fetching ? <Spinner className="inline ml-2" /> : null}
              {isChanged ? (
                <SuccessMessage className="ml-4" inline>
                  {t("pages.account.passwordChangeSuccess")}
                </SuccessMessage>
              ) : null}
              {error ? (
                <ErrorMessage className="ml-4" inline>
                  {(() => {
                    if (get(error, "response.status") === 406) {
                      return t("pages.account.passwordNotCorrect");
                    }
                    return t("pages.account.passwordChangeError");
                  })()}
                </ErrorMessage>
              ) : null}
            </form>
          </Card>
        </div>
      </PageContainer>
    </Fragment>
  );
};

export default AccountPage;
