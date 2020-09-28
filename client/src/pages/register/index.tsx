import { get } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useCallback, useContext } from "preact/hooks";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import * as EmailValidator from "email-validator";

import Button from "../../ui/button";
import { ErrorMessage, SuccessMessage } from "../../ui/message";
import Input from "../../ui/input";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";

import { typedFetch } from "../../utils/typedFetch";
import { RegisterRequest, RegisterResponse } from "../../../../shared/api";
import { TranslateContext } from "@denysvuika/preact-translate";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const labelClasses = "block text-gray-700 text-sm font-bold mt-2";

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
    <PageContainer>
      <h1 className="pb-6">{t("pages.register.title")}</h1>
      <form
        onSubmit={handleSubmit((d) => {
          return signUp(d);
        })}
      >
        <div className="container max-w-md">
          <label class={labelClasses} for="email">
            {t("entities.user.email")}
          </label>
          <Input
            error={!!errors["email"]}
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
          <label class={labelClasses} for="password">
            {t("entities.user.password")}
          </label>
          <Input
            error={!!errors["password"]}
            placeholder="*****"
            inputRef={register({
              minLength: { value: 8, message: t("forms.atLeast", { count: 8 }) },
              required: t("forms.required"),
            })}
            name="password"
            type="password"
          />
          <ErrorMessage textSize="sm">
            {!!errors["password"] ? get(errors["password"], "message") : ""}
          </ErrorMessage>
          <label class={labelClasses} for="firstName">
            {t("entities.user.firstName")}
          </label>
          <Input
            error={!!errors["firstName"]}
            placeholder={t("entities.user.firstNamePlaceholder")}
            inputRef={register({
              required: t("forms.required"),
            })}
            name="firstName"
            type="text"
          />
          <ErrorMessage textSize="sm">
            {!!errors["firstName"] ? get(errors["firstName"], "message") : ""}
          </ErrorMessage>
          <label class={labelClasses} for="lastName">
            {t("entities.user.lastName")}
          </label>
          <Input
            error={!!errors["lastName"]}
            placeholder={t("entities.user.lastNamePlaceholder")}
            inputRef={register({
              required: t("forms.required"),
            })}
            name="lastName"
            type="text"
          />
          <ErrorMessage textSize="sm">
            {!!errors["lastName"] ? get(errors["lastName"], "message") : ""}
          </ErrorMessage>
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
          {submitSuccessful ? (
            <div>
              <Button onClick={onRedo} variant="primary">
                {t("pages.register.addMore")}
              </Button>
            </div>
          ) : null}
        </div>
      </form>
    </PageContainer>
  );
};

export default RegisterPage;
