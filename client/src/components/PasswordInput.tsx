import { FunctionalComponent, h } from "preact";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext } from "preact/hooks";
import Input, { InputProps } from "../ui/input";
import { useToggle } from "../utils/useToggle";

import visiOn from "../assets/visibility-black.svg";
import visiOff from "../assets/visibility_off-black.svg";

const iconStyle = {
  right: "0.5em",
  top: "0.5em",
};

const PasswordInput: FunctionalComponent<InputProps> = (props) => {
  const { t } = useContext(TranslateContext);
  const [showPassword, toggleShowPassword] = useToggle(false);
  return (
    <div className="relative">
      <Input {...props} type={showPassword ? "text" : "password"} />
      <img
        alt={t("components.passwordInput.visibilitySwitchAlt")}
        className="absolute cursor-pointer h-5 w-5"
        onClick={toggleShowPassword}
        src={showPassword ? visiOff : visiOn}
        style={iconStyle}
        title={t("components.passwordInput.visibilitySwitchAlt")}
      />
    </div>
  );
};

export default PasswordInput;
