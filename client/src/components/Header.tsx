import { Fragment, FunctionalComponent, h } from "preact";
import cn from "classnames";
import { useCallback, useContext, useMemo, useState } from "preact/hooks";
import { Link } from "preact-router/match";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useMutation } from "react-query";

import Button, { createButtonClasses } from "../ui/button";
import { pageTitle } from "../constants";
import { UserContext } from "../contexts/user";
import UserMenu from "../components/UserMenu";
import { routes } from "../routes";

const Header: FunctionalComponent = () => {
  const { lang, setLang, t } = useContext(TranslateContext);
  const { isLoading, remove, user } = useContext(UserContext);
  const [mobileNavigationShown, setMobileNavigationShown] = useState<boolean>(false);

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
    <header class="bg-blue-800 w-full px-4">
      <div class="flex items-center py-1">
        <nav class="block flex flex-grow md:hidden">
          <button
            class={cn(
              "flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white",
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
        <nav class="w-full block flex-grow md:flex md:items-center nd:w-auto md:block p-2">
          <div class="text-white text-md xl:text-2xl">
            <Link href="/">{pageTitle}</Link>
          </div>
          <div
            class={cn("text-sm lg:flex-grow hidden md:block", {
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
  );
};

export default Header;
