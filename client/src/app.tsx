import { Fragment, h, render } from "preact";
import "preact/devtools";
import cn from "classnames";
import { useContext, useMemo, useState } from "preact/hooks";
import { TranslateContext, TranslateProvider } from "@denysvuika/preact-translate";
import Router, { Route } from "preact-router";
import { Link } from "preact-router/match";
import { useQuery, useMutation } from "react-query";
import { createClient, Provider } from "@urql/preact";
import { get } from "lodash";
import "./base.css";

import AccountPage from "./pages/account";
import AddAttendant from "./pages/addattendant";
import MeetingPage from "./pages/meeting";
import MeetingAddPage from "./pages/meetingadd";
import MeetingListPage from "./pages/meetinglist";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import UserMenu from "./components/UserMenu";

import { SharedUser } from "../../shared/user";
import { UserContext } from "./contexts/user";

import { routes } from "./routes";

const client = createClient({ url: `${get(process.env, "hostname", "")}/graphql` });

const App = () => {
  const [mobileNavigationShown, setMobileNavigationShown] = useState<boolean>(false);
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
    { retry: false },
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

  return (
    <Fragment>
      <header class="flex items-center justify-between flex-wrap bg-blue-800 p-6">
        <nav class="block flex lg:hidden">
          <button
            class="flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
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
          <div class="text-white text-2xl ml-4">Pricora</div>
        </nav>
        <nav
          class={cn("w-full block flex-grow lg:flex lg:items-center lg:w-auto lg:block", {
            "xs:hidden": !mobileNavigationShown,
          })}
        >
          <div class="text-sm lg:flex-grow">
            <span class="text-white text-2xl mr-4">Pricora</span>
            {user ? (
              <Fragment>
                <Link
                  href={routes.meetinglist}
                  class="block mt-4 lg:inline-block lg:mt-0 text-gray-200 hover:text-white mr-4"
                >
                  {t("navigation.meetinglist")}
                </Link>
                <Link
                  href={routes.meetingadd}
                  class="block mt-4 lg:inline-block lg:mt-0 text-gray-200 hover:text-white mr-4"
                >
                  {t("navigation.addMeeting")}
                </Link>
              </Fragment>
            ) : null}
          </div>
          <div>
            {(() => {
              if (!isLoading) {
                return !user ? (
                  <Link
                    href={routes.login}
                    class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                  >
                    {t("navigation.login")}
                  </Link>
                ) : (
                  <Fragment>
                    <UserMenu logout={logout} user={user} />
                  </Fragment>
                );
              }
              return null;
            })()}
          </div>
        </nav>
      </header>
      <UserContext.Provider
        value={useMemo(() => ({ user, refetchUser: refetch, isLoading }), [
          user,
          isLoading,
          refetch,
        ])}
      >
        <Provider value={client}>
          <Router>
            <PrivateRoute path={routes.account} Component={AccountPage} />
            <AdminRoute path={routes.register} Component={RegisterPage} />
            <PrivateRoute path={routes.meeting()} Component={MeetingPage} />
            <PrivateRoute path={routes.meetingadd} Component={MeetingAddPage} />
            <Route path={routes.login} component={LoginPage} />
            <PrivateRoute path={routes.meetinglist} Component={MeetingListPage} />
            <Route path={routes.addattendant()} component={AddAttendant} />
            <PrivateRoute path="/" Component={MeetingListPage} />
          </Router>
        </Provider>
      </UserContext.Provider>
    </Fragment>
  );
};

render(
  <TranslateProvider
    fallbackLang={process.env.language}
    lang={process.env.language}
    root={`${get(process.env, "hostname", "")}/i18n`}
  >
    <App />
  </TranslateProvider>,
  document.body,
);
