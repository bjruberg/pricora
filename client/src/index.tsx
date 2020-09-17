import { Fragment, h, render } from "preact";
import Router from "preact-router";
import { Link } from "preact-router/match";
import { useQuery } from "react-query";
import "./base.css";

import EventListPage from "./pages/events";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

const App = () => {
  useQuery("user", () => {
    return fetch("/api/getUser", {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
  return (
    <Fragment>
      <nav class="flex items-center justify-between flex-wrap bg-teal-800 p-6">
        <div class="block lg:hidden">
          <button class="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
            <svg
              class="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div class="text-sm lg:flex-grow">
            <Link
              href="/eventlist"
              class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
            >
              Veranstaltungen
            </Link>
            <a
              href="#responsive-header"
              class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
            >
              Examples
            </a>
            <a
              href="#responsive-header"
              class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white"
            >
              Blog
            </a>
          </div>
          <div>
            <a
              href="/login"
              class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
            >
              Login
            </a>
          </div>
        </div>
      </nav>
      <Router>
        <RegisterPage path="/register" />
        <EventListPage path="/eventlist" />
        <LoginPage path="/login" />
      </Router>
    </Fragment>
  );
};

render(<App />, document.body);
