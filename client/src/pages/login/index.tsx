import { get } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { TranslateContext } from "@denysvuika/preact-translate";
import { route } from "preact-router";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as EmailValidator from "email-validator";

import Button from "../../ui/button";
import Input from "../../ui/input";
import { Label } from "../../ui/label";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";
import { UserContext } from "../../contexts/user";

import { typedFetch } from "../../utils/typedFetch";
import { LoginRequest, LoginResponse } from "../../../../shared/api";
import { ErrorMessage } from "../../ui/message";
import { routes } from "../../routes";

interface FormData {
  username: string;
  password: string;
}

const LoginPage: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  const { refetchUser } = useContext(UserContext);
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [login, { error: apiError, status }] = useMutation<void, number, FormData>(
    (params) => {
      return typedFetch<LoginRequest, LoginResponse>("/api/login", {
        body: {
          email: params.username,
          password: params.password,
        },
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }).then((response) => {
        if (response.status !== 200) {
          if (response.status === 409) {
            return Promise.reject(409);
          }
          return Promise.reject(response.status);
        }
        return;
      });
    },

    {
      onSuccess: () => {
        void refetchUser();
        route(routes.meetinglist);
      },
    },
  );

  const onSubmit = useMemo(() => {
    return handleSubmit((d) => {
      return login(d);
    });
  }, [handleSubmit, login]);

  return (
    <PageContainer>
      <h1 className="pb-6">{t("pages.login.title")}</h1>
      <form onSubmit={onSubmit}>
        <div className="container mt-4 max-w-md">
          <Label for="username">{t("entities.user.email")}</Label>
          <Input
            autocomplete="email"
            error={!!errors["username"]}
            id="username"
            placeholder="me@server.com"
            name="username"
            inputRef={register({
              validate: {
                email: (val) => (EmailValidator.validate(val) ? true : t("forms.email")),
              },
              required: t("forms.required"),
            })}
            required
            type="email"
          />
          <ErrorMessage>
            {!!errors["username"] ? get(errors["username"], "message") : ""}
          </ErrorMessage>
          <Label className="mt-4" for="password">
            {t("entities.user.password")}
          </Label>
          <Input
            autocomplete="current-password"
            error={!!errors["password"]}
            id="password"
            placeholder="*****"
            inputRef={register({
              minLength: { value: 8, message: t("forms.atLeast", { count: 8 }) },
              required: t("forms.required"),
            })}
            name="password"
            type="password"
          />
          <ErrorMessage>
            {!!errors["password"] ? get(errors["password"], "message") : ""}
          </ErrorMessage>
          <Button class="mt-6" disabled={status === "loading"} type="submit" variant="primary">
            {t("actions.login")}
          </Button>
          {status === "loading" ? <Spinner className="inline ml-2" /> : null}
          {apiError ? (
            <ErrorMessage inline className="ml-4 inline-block">
              {(() => {
                if (apiError === 409) {
                  return t("pages.login.wrongCredentials");
                } else {
                  return t("pages.login.networkError");
                }
              })()}
            </ErrorMessage>
          ) : null}
        </div>
      </form>
    </PageContainer>
  );
};

export default LoginPage;
