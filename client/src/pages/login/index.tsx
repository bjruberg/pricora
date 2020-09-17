import { get } from "lodash";
import { FunctionalComponent, h } from "preact";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as EmailValidator from "email-validator";

import Button from "../../ui/button";
import Input from "../../ui/input";
import Spinner from "../../ui/spinner";
import PageContainer from "../../components/PageContainer";

import { typedFetch } from "../../utils/typedFetch";
import { LoginRequest, LoginResponse } from "../../../../api/src/api";

interface FormData {
  email: string;
  password: string;
}

interface ApiError {
  msg: string;
}

const LoginPage: FunctionalComponent = () => {
  const { errors, handleSubmit, register } = useForm<FormData>();

  const [login, { error: apiError, status }] = useMutation<Response | void, ApiError, FormData>(
    (params) => {
      return typedFetch<LoginRequest, LoginResponse>("/api/login", {
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
      <h1 className="pb-6">Als Benutzer anmelden</h1>
      <form
        onSubmit={handleSubmit((d) => {
          void login(d);
        })}
      >
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
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
        <div class="h-4 text-red-700">
          {!!errors["email"] ? get(errors["email"], "message") : ""}
        </div>
        <label class="block text-gray-700 text-sm font-bold mt-2" for="password">
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
        <div class="h-4 text-red-700">
          {!!errors["password"] ? get(errors["password"], "message") : ""}
        </div>
        <Button disabled={status === "loading"} type="submit" variant="primary">
          Anmelden
        </Button>
        {status === "loading" ? <Spinner className="inline ml-2" /> : null}
        {apiError ? <span class="h-4 ml-2 text-red-700">{apiError.msg}</span> : null}
      </form>
    </PageContainer>
  );
};

export default LoginPage;
