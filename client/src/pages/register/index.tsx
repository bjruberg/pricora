import { get } from "lodash";
import { Fragment, FunctionalComponent, h } from "preact";
import { useCallback, useContext } from "preact/hooks";
import { Link } from "preact-router/match";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import * as EmailValidator from "email-validator";

import Button from "../../ui/button";
import { ErrorMessage, SuccessMessage } from "../../ui/message";
import Input from "../../ui/input";
import Breadcrumbs from "../../components/Breadcrumbs";
import PasswordInput from "../../components/PasswordInput";
import { Label } from "../../ui/label";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";
import { routes } from "../../routes";

import { typedFetch } from "../../utils/typedFetch";
import { RegisterRequest, RegisterResponse } from "../../../../shared/api";
import { TranslateContext } from "@denysvuika/preact-translate";

interface FormData {
  isAdmin: boolean;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const RegisterPage: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  const { errors, handleSubmit, register, reset } = useForm<FormData>();

  const [signUp, { error: apiError, reset: resetMutation, status }] = useMutation<
    void,
    string | number,
    FormData
  >((params) => {
    return typedFetch<RegisterRequest, RegisterResponse>("/api/register", {
      body: params,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then((response) => {
      if (response.status !== 200) {
        if (response.status === 409) {
          return Promise.reject("Nutzer existiert bereits");
        }
        return Promise.reject(response.status);
      }
      return;
    });
  });

  const onRedo = useCallback(() => {
    reset();
    resetMutation();
  }, [reset, resetMutation]);

  const submitSuccessful = status === "success";

  return (
    <Fragment>
      <Breadcrumbs>
        <Link aria-current="page" href={routes.account}>
          {t("navigation.addUser")}
        </Link>
      </Breadcrumbs>
      <PageContainer>
        <h1 className="pb-6">{t("pages.register.title")}</h1>
        <form
          onSubmit={handleSubmit((d) => {
            return signUp(d);
          })}
        >
          <div className="container max-w-md">
            <Label for="email">{t("entities.user.email")}</Label>
            <Input
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
              required
              type="email"
            />
            <ErrorMessage textSize="sm">
              {!!errors["email"] ? get(errors["email"], "message") : ""}
            </ErrorMessage>
            <Label for="password">{t("entities.user.password")}</Label>
            <PasswordInput
              error={!!errors["password"]}
              placeholder="*****"
              id="password"
              inputRef={register({
                minLength: { value: 8, message: t("forms.atLeast", { count: 8 }) },
                required: t("forms.required"),
              })}
              name="password"
            />
            <ErrorMessage textSize="sm">
              {!!errors["password"] ? get(errors["password"], "message") : ""}
            </ErrorMessage>
            <Label for="firstName">{t("entities.user.firstName")}</Label>
            <Input
              error={!!errors["firstName"]}
              placeholder={t("entities.user.firstNamePlaceholder")}
              id="firstName"
              inputRef={register({
                required: t("forms.required"),
              })}
              name="firstName"
              type="text"
            />
            <ErrorMessage textSize="sm">
              {!!errors["firstName"] ? get(errors["firstName"], "message") : ""}
            </ErrorMessage>
            <Label for="lastName">{t("entities.user.lastName")}</Label>
            <Input
              error={!!errors["lastName"]}
              placeholder={t("entities.user.lastNamePlaceholder")}
              id="lastName"
              inputRef={register({
                required: t("forms.required"),
              })}
              name="lastName"
              type="text"
            />
            <ErrorMessage textSize="sm">
              {!!errors["lastName"] ? get(errors["lastName"], "message") : ""}
            </ErrorMessage>
            <Label class="inline-block" for="isAdmin">
              {t("entities.user.isAdmin")}:
              <input
                class="inline-block m-2"
                ref={register()}
                id="isAdmin"
                name="isAdmin"
                type="checkbox"
              />
            </Label>
            <div>
              <Button
                className="mr-2"
                disabled={status === "loading" || submitSuccessful}
                type="submit"
                variant="primary"
              >
                {t("actions.register")}
              </Button>
              {status === "loading" ? <Spinner className="inline" /> : null}
              {apiError ? <ErrorMessage inline>{apiError}</ErrorMessage> : null}
              {submitSuccessful ? (
                <SuccessMessage inline>{t("pages.register.success")}</SuccessMessage>
              ) : null}
            </div>
            {submitSuccessful ? (
              <div className="mt-2">
                <Button onClick={onRedo} variant="primary">
                  {t("pages.register.addMore")}
                </Button>
              </div>
            ) : null}
          </div>
        </form>
      </PageContainer>
    </Fragment>
  );
};

export default RegisterPage;
