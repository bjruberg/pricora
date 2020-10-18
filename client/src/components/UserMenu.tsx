import { TranslateContext } from "@denysvuika/preact-translate";
import cn from "classnames";
import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router";
import { useContext, useEffect } from "preact/hooks";
import { useToggle } from "../utils/useToggle";
import avatar from "../assets/account_circle.svg";

import { routes } from "../routes";
import { UserContext } from "../contexts/user";

interface UserMenuProps {
  logout: () => void;
  toggleMenu: () => void;
}

interface UserAvatarProps {
  logout: () => void;
}

const menuLinkClass = "block px-2 py-1 text-blue-700 hover:bg-blue-200";

const UserMenu: FunctionalComponent<UserMenuProps> = ({ logout, toggleMenu }) => {
  const { t } = useContext(TranslateContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (document.getElementById("usermenu")?.contains(e.target as Node)) {
        return;
      }
      toggleMenu();
    };
    document.addEventListener("mousedown", handleClick, false);

    return () => {
      document.removeEventListener("mousedown", handleClick, false);
    };
  });

  if (!user) {
    return null;
  }

  return (
    <ul
      class={cn(
        "absolute bottom-auto right-0 border border-gray-700 mt-2 py-1 w-48 bg-white rounded-sm shadow-xl",
      )}
      role="menu"
    >
      <div class="px-2 border-gray-500">
        {t("navigation.hello")} <strong>{user.firstName}</strong>
      </div>
      <li role="none">
        <Link class={menuLinkClass} href={routes.account} onClick={toggleMenu} role="menuitem">
          {t("navigation.account")}
        </Link>
      </li>
      {user.isAdmin ? (
        <Link href={routes.register} class={menuLinkClass} onClick={toggleMenu}>
          {t("navigation.addUser")}
        </Link>
      ) : null}
      {user.isAdmin ? (
        <Link href={routes.userlist} class={menuLinkClass} onClick={toggleMenu}>
          {t("navigation.userlist")}
        </Link>
      ) : null}
      <li role="none">
        <a
          class={menuLinkClass}
          href={routes.login}
          onClick={() => {
            logout();
            toggleMenu();
          }}
          role="menuitem"
        >
          {t("navigation.logout")}
        </a>
      </li>
    </ul>
  );
};

const UserAvatar: FunctionalComponent<UserAvatarProps> = ({ logout }) => {
  const [menuState, toggleMenu] = useToggle(false);

  const { t } = useContext(TranslateContext);
  return (
    <div id="usermenu">
      <div class="relative">
        <button aria-haspopup={true} aria-expanded={menuState} onClick={toggleMenu}>
          <img class="w-12 h-12" src={avatar} alt={t("navigation.toggleUserMenu")} />
        </button>
      </div>
      {menuState ? <UserMenu logout={logout} toggleMenu={toggleMenu} /> : null}
    </div>
  );
};

export default UserAvatar;
