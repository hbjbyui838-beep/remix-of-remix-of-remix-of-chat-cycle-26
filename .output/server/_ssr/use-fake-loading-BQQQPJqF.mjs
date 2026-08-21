import { r as __toESM } from "../_runtime.mjs";
import { D as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-fake-loading-BQQQPJqF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** Small helper so every list can show its skeleton state on first paint. */
function useFakeLoading(ms = 450) {
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => setLoading(false), ms);
		return () => clearTimeout(t);
	}, [ms]);
	return loading;
}
//#endregion
export { useFakeLoading as t };
