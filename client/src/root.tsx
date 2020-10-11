import { Fragment, FunctionalComponent, h } from "preact";
import cn from "classnames";
import { useCallback, useContext, useMemo, useState } from "preact/hooks";
import { TranslateContext } from "@denysvuika/preact-translate";
import Router, { Route } from "preact-router";
import { Link } from "preact-router/match";
import { useQuery, useMutation } from "react-query";
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
import PrivateRoute from "./components/PrivateRoute";
import Topline from "./components/Topline";
import UserMenu from "./components/UserMenu";

import { SharedUser } from "../../shared/user";
import { UserContext } from "./contexts/user";

import Button, { createButtonClasses } from "./ui/button";
import { pageTitle } from "./constants";
import { routes } from "./routes";

const gqlClient = createClient({ url: `${get(process.env, "hostname", "")}/graphql` });

const AppRoot: FunctionalComponent = () => {
  const [mobileNavigationShown, setMobileNavigationShown] = useState<boolean>(false);
  const { lang, setLang, t } = useContext(TranslateContext);

  console.log({ lang });

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

  const [logout] = useMutation(() => {
    return fetch("/api/logout", {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then(() => {
      remove();
    });
  });

  const LinkNode = useMemo(
    () =>
      user ? (
        <Link
          href={routes.meetinglist}
          class={cn("block lg:inline-block text-gray-200 hover:text-white ml-4 mr-4")}
        >
          {t("navigation.meetinglist")}
        </Link>
      ) : null,
    [t, user],
  );

  return (
    <Fragment>
      <UserContext.Provider
        value={useMemo(() => ({ user, refetchUser: refetch, isLoading }), [
          user,
          isLoading,
          refetch,
        ])}
      >
        <Topline />
        <header class="bg-blue-800 w-full px-4">
          <div class="flex items-center py-1">
            <nav class="block flex flex-grow lg:hidden">
              <button
                class={cn(
                  "flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white mr-4",
                  {
                    hidden: !user,
                  },
                )}
                onClick={() => setMobileNavigationShown(!mobileNavigationShown)}
              >
                <svg
                  class="fill-current h-3 w-3"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
              </button>
            </nav>
            <nav class="w-full block flex-grow lg:flex lg:items-center lg:w-auto lg:block p-2">
              <div class="text-white text-xl xl:text-2xl">
                <Link href="/">{pageTitle}</Link>
              </div>
              <div
                class={cn("text-sm lg:flex-grow hidden sm:block", {
                  hidden: !user,
                })}
              >
                {LinkNode}
              </div>
            </nav>
            <div className="whitespace-no-wrap text-white">
              <Button
                active={lang === "en"}
                className="mr-1"
                onClick={useCallback(() => {
                  setLang("en");
                  localStorage.setItem("language", "en");
                }, [setLang])}
                slim
                variant="inline"
              >
                Eng
              </Button>
              <Button
                active={lang === "de"}
                className="mr-1"
                onClick={useCallback(() => {
                  setLang("de");
                  localStorage.setItem("language", "de");
                }, [setLang])}
                slim
                variant="inline"
              >
                Deu
              </Button>
            </div>
            <div className="ml-1">
              {(() => {
                if (!isLoading) {
                  return !user ? (
                    <Link href={routes.login} class={createButtonClasses({ variant: "inline" })}>
                      {t("navigation.login")}
                    </Link>
                  ) : (
                    <Fragment>
                      <UserMenu logout={logout} />
                    </Fragment>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          <nav class={cn("py-2", { hidden: !mobileNavigationShown })}>{LinkNode}</nav>
        </header>
        {user?.requirePasswordChange ? (
          <div class="width-full bg-red-600 px-5 py-1 text-white text-xs">
            {t("general.passwordChangeWarning")}{" "}
            <Link href={routes.account}>
              <strong>{t("navigation.account")}</strong>
            </Link>
          </div>
        ) : null}
        <div></div>
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
