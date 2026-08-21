import { E as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-banner-CJLtAKw5.js
var import_jsx_runtime = require_jsx_runtime();
var logo_default = "/assets/logo-BLBh_Cfa.png";
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/** Brand mark for «دز رکاب» — used in headers, sidebar, chat and login. */
function Logo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: logo_default,
		alt: "دز رکاب",
		width: 96,
		height: 96,
		className: cn("size-10 shrink-0 rounded-xl object-contain", className)
	});
}
//#endregion
export { cn as n, Logo as t };
