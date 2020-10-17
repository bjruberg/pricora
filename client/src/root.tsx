import { Fragment, FunctionalComponent, h } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { TranslateContext } from "@denysvuika/preact-translate";
import Router, { Route } from "preact-router";
import Match, { Link } from "preact-router/match";
import { useQuery } from "react-query";
import { createClient, Provider } from "@urql/preact";
import { get } from "lodash";
import "./base.css";

import AccountPage from "./pages/account";
import AddAttendant from "./pages/addattendant";
import LandingPage from "./pages/landing";
import MeetingPage from "./pages/meeting";
import MeetingAddPage from "./pages/meetingadd";
import MeetingAttendantsPage from "./pages/meetingattendants";
import MeetingSharePage from "./pages/meetingshare";
import MeetingListPage from "./pages/meetinglist";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import UserlistPage from "./pages/userlist";

import AdminRoute from "./components/AdminRoute";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import Topline from "./components/Topline";

import { SharedUser } from "../../shared/user";
import { UserContext } from "./contexts/user";

import { routes } from "./routes";

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
            <PrivateRoute path={routes.account} Component={AccountPage} />
            <AdminRoute path={routes.register} Component={RegisterPage} />
            <PrivateRoute path={routes.meeting()} Component={MeetingPage} />
            <PrivateRoute path={routes.meetingadd} Component={MeetingAddPage} />
            <PrivateRoute path={routes.meetingattendants()} Component={MeetingAttendantsPage} />
            <PrivateRoute path={routes.meetingshare()} Component={MeetingSharePage} />
            <Route path={routes.login} component={LoginPage} />
            <PrivateRoute path={routes.meetinglist} Component={MeetingListPage} />
            <Route path={routes.addattendant()} component={AddAttendant} />
            <PrivateRoute path={routes.userlist} Component={UserlistPage} />
            <Route path="/" component={LandingPage} />
          </Router>
        </Provider>
      </UserContext.Provider>
    </Fragment>
  );
};

export default AppRoot;
