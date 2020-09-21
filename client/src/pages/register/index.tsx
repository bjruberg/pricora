import { get } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

import * as EmailValidator from "email-validator";

import Button from "../../ui/button";
import ErrorMessage from "../../ui/errormessage";
import Input from "../../ui/input";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";

import { typedFetch } from "../../utils/typedFetch";
import { RegisterRequest, RegisterResponse } from "../../../../shared/api";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface ApiError {
  msg: string;
}

const labelClasses = "block text-gray-700 text-sm font-bold";

const RegisterPage: FunctionalComponent = () => {
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [signUp, { error: apiError, status }] = useMutation<Response | void, ApiError, FormData>(
    (params) => {
      return typedFetch<RegisterRequest, RegisterResponse>("/api/register", {
        body: params,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }).then((response) => {
        if (response.status !== 200) {
          return response.json().then((resp) => Promise.reject(resp));
        }
        return response;
      });
    },
  );

  return (
    <PageContainer>
      <h1 className="pb-6">Neuen Benutzer registrieren</h1>
      <form
        onSubmit={handleSubmit((d) => {
          void signUp(d);
        })}
      >
        <label class={labelClasses} for="email">
          E-Mail
        </label>
        <Input
          error={!!errors["email"]}
          placeholder="me@server.com"
          name="email"
          inputRef={register({
            validate: {
              email: (val) =>
                EmailValidator.validate(val) ? true : "Es muss sich um eine E-Mail Adresse handeln",
            },
            required: "Notwendig",
          })}
          required
          type="text"
        />
        <ErrorMessage>{!!errors["email"] ? get(errors["email"], "message") : ""}</ErrorMessage>
        <label class={labelClasses} for="password">
          Passwort
        </label>
        <Input
          error={!!errors["password"]}
          placeholder="*****"
          inputRef={register({
            minLength: { value: 8, message: "At least 8 characters are required" },
            required: "Notwendig",
          })}
          name="password"
          type="password"
        />
        <ErrorMessage>
          {!!errors["password"] ? get(errors["password"], "message") : ""}
        </ErrorMessage>
        <label class={labelClasses} for="firstName">
          Vorname
        </label>
        <Input
          error={!!errors["firstName"]}
          placeholder="Michael"
          inputRef={register({
            required: "Notwendig",
          })}
          name="firstName"
          type="text"
        />
        <ErrorMessage>
          {!!errors["firstName"] ? get(errors["firstName"], "message") : ""}
        </ErrorMessage>
        <label class={labelClasses} for="lastName">
          Nachname
        </label>
        <Input
          error={!!errors["lastName"]}
          placeholder="Jackson"
          inputRef={register({
            required: "Notwendig",
          })}
          name="lastName"
          type="text"
        />
        <ErrorMessage>
          {!!errors["firstName"] ? get(errors["firstName"], "message") : ""}
        </ErrorMessage>
        <Button disabled={status === "loading"} type="submit" variant="primary">
          Registrieren
        </Button>
        {status === "loading" ? <Spinner className="inline ml-2" /> : null}
        {apiError ? <span class="h-4 ml-2 text-red-700">{apiError.msg}</span> : null}
      </form>
    </PageContainer>
  );
};

export default RegisterPage;
