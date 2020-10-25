import { Fragment, FunctionalComponent, h } from "preact";
import { useContext, useCallback, useMemo } from "preact/hooks";
import { TranslateContext } from "@denysvuika/preact-translate";
import Router, { Route } from "preact-router";
import AsyncRoute from "preact-async-route";
import Match, { Link } from "preact-router/match";
import { useQuery } from "react-query";
import { createClient, Provider } from "@urql/preact";
import { get } from "lodash";
import "./base.css";

import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import Topline from "./components/Topline";

import { SharedUser } from "../../shared/user";
import { UserContext } from "./contexts/user";

import { routes } from "./routes";

// Place addAttendant page in main bundle to reach best loading performance for users
import AddAttendant from "./pages/addattendant";

const getDefault = (
  module:
    | typeof import("./pages/meetingadd")
    | typeof import("./pages/meetingshare")
    | typeof import("./pages/addattendant")
    | typeof import("./pages/account"),
) => module.default;

const gqlClient = createClient({ url: `${get(process.env, "hostname", "")}/graphql` });

const AppRoot: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);

  const { data: user, isLoading, refetch, remove } = useQuery<SharedUser>(
    "user",
    () => {
      return fetch("/api/getUser", {
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((resp) => {
        if (resp.status === 200) {
          return resp.json();
        }
        return Promise.reject();
      });
    },
    { retry: false, refetchOnWindowFocus: false },
  );

  return (
    <Fragment>
      <UserContext.Provider
        value={useMemo(() => ({ user, refetchUser: refetch, remove, isLoading }), [
          user,
          isLoading,
          refetch,
          remove,
        ])}
      >
        <Topline />
        <Match path={routes.meetingshare()}>{({ matches }) => (matches ? null : <Header />)}</Match>
        {user?.requirePasswordChange ? (
          <div class="width-full bg-red-600 px-5 py-1 text-white text-xs">
            {t("general.passwordChangeWarning")}{" "}
            <Link href={routes.account}>
              <strong>{t("navigation.account")}</strong>
            </Link>
          </div>
        ) : null}
        <Provider value={gqlClient}>
          <Router>
            <PrivateRoute
              path={routes.account}
              getComponent={useCallback(() => import("./pages/account").then(getDefault), [])}
            />
            <AdminRoute
              path={routes.register}
              getComponent={useCallback(() => import("./pages/register").then(getDefault), [])}
            />
            <PrivateRoute
              path={routes.meeting()}
              getComponent={useCallback(() => import("./pages/meeting").then(getDefault), [])}
            />
            <PrivateRoute
              path={routes.meetingadd}
              getComponent={useCallback(() => import("./pages/meetingadd").then(getDefault), [])}
            />
            <PrivateRoute
              path={routes.meetingattendants()}
              getComponent={useCallback(
                () => import("./pages/meetingattendants").then(getDefault),
                [],
              )}
            />
            <PrivateRoute
              path={routes.meetingshare()}
              getComponent={useCallback(() => import("./pages/meetingshare").then(getDefault), [])}
            />
            <AsyncRoute
              path={routes.login}
              getComponent={useCallback(() => import("./pages/login").then(getDefault), [])}
            />
            <PrivateRoute
              path={routes.meetinglist}
              getComponent={useCallback(() => import("./pages/meetinglist").then(getDefault), [])}
            />
            <Route path={routes.addattendant()} component={AddAttendant} />
            <AdminRoute
              path={routes.userlist}
              getComponent={useCallback(() => import("./pages/userlist").then(getDefault), [])}
            />
            <AsyncRoute
              path={routes.welcome}
              getComponent={useCallback(() => import("./pages/landing").then(getDefault), [])}
            />
          </Router>
        </Provider>
      </UserContext.Provider>
    </Fragment>
  );
};

export default AppRoot;
