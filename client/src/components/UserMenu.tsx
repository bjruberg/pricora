import { TranslateContext } from "@denysvuika/preact-translate";
import cn from "classnames";
import { FunctionalComponent, h } from "preact";
import { Link } from "preact-router";
import { useContext } from "preact/hooks";
import { useToggle } from "../utils/useToggle";
import avatar from "../assets/account_circle.svg";

import { SharedUser } from "../../../shared/user";
import { routes } from "../routes";

interface UserMenuProps {
  logout: () => void;
  user: SharedUser;
}

const menuLinkClass = "block px-2 py-1 text-blue-700 hover:bg-blue-200";

const UserMenu: FunctionalComponent<UserMenuProps> = ({ logout, user }) => {
  const { t } = useContext(TranslateContext);
  const [menuState, toggleMenu] = useToggle(false);

  return (
    <div class="relative">
      <button aria-haspopup={true} aria-expanded={menuState} onClick={toggleMenu}>
        <img class="w-8 h-8" src={avatar} />
      </button>
      <ul
        class={cn(
          "absolute bottom-auto right-0 border border-gray-700 mt-2 py-1 w-48 bg-white rounded-sm shadow-xl",
          {
            hidden: !menuState,
          },
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
    </div>
  );
};

export default UserMenu;
