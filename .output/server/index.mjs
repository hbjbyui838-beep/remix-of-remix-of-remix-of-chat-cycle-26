globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.png": {
		"type": "image/png",
		"etag": "\"19b7-H8KBJcWOSBnARbio3KjA+Lhw37I\"",
		"mtime": "2026-08-18T01:11:51.354Z",
		"size": 6583,
		"path": "../public/favicon.png"
	},
	"/manifest.webmanifest": {
		"type": "application/manifest+json",
		"etag": "\"260-yVQHgIoCHtNsJxKRuBBD8io2rd8\"",
		"mtime": "2026-08-18T01:11:51.354Z",
		"size": 608,
		"path": "../public/manifest.webmanifest"
	},
	"/offline.html": {
		"type": "text/html; charset=utf-8",
		"etag": "\"1435-0Os9hFH6PZk1qayOZYQRrbk6SqE\"",
		"mtime": "2026-08-18T01:11:51.354Z",
		"size": 5173,
		"path": "../public/offline.html"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-18T01:11:51.354Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/sw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ba0-plAB8vDXeDjV0FNyZKXwklwwHzA\"",
		"mtime": "2026-08-18T01:11:51.354Z",
		"size": 11168,
		"path": "../public/sw.js"
	},
	"/assets/PeopleIntroSection-D2FJ8ePR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1692-81Qj1eLNiO+Pic2lImykKRWKeZM\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 5778,
		"path": "../public/assets/PeopleIntroSection-D2FJ8ePR.js"
	},
	"/assets/PermissionsManager-B2oPD_au.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"163c-AjHTFOYMu+FJzxbCy3rblZlahzQ\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 5692,
		"path": "../public/assets/PermissionsManager-B2oPD_au.js"
	},
	"/assets/_id-BYYrUN4m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d42-TmaAjyGb885GPUeHUxSG2O/Agxg\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 11586,
		"path": "../public/assets/_id-BYYrUN4m.js"
	},
	"/assets/_id-Bk_bXFXZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6e-eOY0aQmkOwfYP+AGoLAVsViaVgM\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 6766,
		"path": "../public/assets/_id-Bk_bXFXZ.js"
	},
	"/assets/_id-D5uEOPb6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ce-gVc9f1kGs58gjvUdY0MqPDy5rVQ\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 13518,
		"path": "../public/assets/_id-D5uEOPb6.js"
	},
	"/assets/admin-DMwaZM5s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18e7-Eof5vjOrfHgzHtQ94YgRqvCCVcU\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 6375,
		"path": "../public/assets/admin-DMwaZM5s.js"
	},
	"/assets/alert-dialog-CFNicPaP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12cb-JGzVPqJhZVCY7cgWrodgwwO/3s8\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 4811,
		"path": "../public/assets/alert-dialog-CFNicPaP.js"
	},
	"/assets/archive-CxsA6tV0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f9-woVcBtoR3PvtNAeKcrtR0PdImUc\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 249,
		"path": "../public/assets/archive-CxsA6tV0.js"
	},
	"/assets/arrow-right-iJ-eIHh_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-qMIurDoNJZsJz4pE/L7LeTr9vOE\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 161,
		"path": "../public/assets/arrow-right-iJ-eIHh_.js"
	},
	"/assets/banknote-C3fSBq-s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-9rdYLr+6q9EaJL4ZZSnTqtQ4w6M\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 241,
		"path": "../public/assets/banknote-C3fSBq-s.js"
	},
	"/assets/bicycle-purchases-CIkj4EFg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f7b-ALcTlCnKzbYxdfAoY1bJVEx5KgE\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 3963,
		"path": "../public/assets/bicycle-purchases-CIkj4EFg.js"
	},
	"/assets/bike-DDOP2_pB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11c-SqPRIpU5XBPrG9WMC1gRYofbjS8\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 284,
		"path": "../public/assets/bike-DDOP2_pB.js"
	},
	"/assets/calendar-oi-Ok36V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-D7NQYxwWNgmX2+yjGUuZavpt7nM\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 253,
		"path": "../public/assets/calendar-oi-Ok36V.js"
	},
	"/assets/chart-column-Zs4dH7wq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f7-gA83XrTihlA+qhcOrpi39FdIueg\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 247,
		"path": "../public/assets/chart-column-Zs4dH7wq.js"
	},
	"/assets/chat-bg-wA2hKdJo.jpg": {
		"type": "image/jpeg",
		"etag": "\"1460e-2UJbb3nzrOxJoMdXsPm+shzSS2Y\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 83470,
		"path": "../public/assets/chat-bg-wA2hKdJo.jpg"
	},
	"/assets/check-check-DN5BK_MZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-LrLxfniyD+bj2bAssg1Eandf6Uo\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 175,
		"path": "../public/assets/check-check-DN5BK_MZ.js"
	},
	"/assets/circle-x-BR-boLvd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-HFPyq9Mjxy6toGrFSp3T9la5mPA\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 328,
		"path": "../public/assets/circle-x-BR-boLvd.js"
	},
	"/assets/clock-DLRV7t1V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-1oczVQ6HgYKT6j7clbizvgypR+Q\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 165,
		"path": "../public/assets/clock-DLRV7t1V.js"
	},
	"/assets/copy-CJ8ujj1c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e8-28fQKMmy3L4HGUQuXwfZHoT/KaA\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 232,
		"path": "../public/assets/copy-CJ8ujj1c.js"
	},
	"/assets/dashboard-wKlVmSbU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1861-tX0FZjMFs0OMLhtXnFCYrXahFhQ\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 6241,
		"path": "../public/assets/dashboard-wKlVmSbU.js"
	},
	"/assets/db-De5LqAJx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1448-a0PuMZIvilq9Bcf0HTWVbi/dwL0\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 5192,
		"path": "../public/assets/db-De5LqAJx.js"
	},
	"/assets/dist-B_CIHKJL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e5d-GenFnGga6RxsqnaDPs0S4w0JdG0\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 7773,
		"path": "../public/assets/dist-B_CIHKJL.js"
	},
	"/assets/earnings-BAJvAl5z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15ff-OidMxDMxbE631AVLvPL0cYQfcKI\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 5631,
		"path": "../public/assets/earnings-BAJvAl5z.js"
	},
	"/assets/earnings-Gqgq4owF.png": {
		"type": "image/png",
		"etag": "\"7b13-QEKdzvhUyDmeQUrvy/LUxGZ/G9k\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 31507,
		"path": "../public/assets/earnings-Gqgq4owF.png"
	},
	"/assets/esm-Bv_6caNF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"160-8ZH+qscIYOi8HcC370OfBHR+Ovg\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 352,
		"path": "../public/assets/esm-Bv_6caNF.js"
	},
	"/assets/expenses-BMYAMg_q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e6-iUNEd59dHows2YTvQcWGZEcAxVo\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 4326,
		"path": "../public/assets/expenses-BMYAMg_q.js"
	},
	"/assets/expenses-BPAcKO1A.png": {
		"type": "image/png",
		"etag": "\"134c4-1lww5pjQmeXWjbMWZKDJjwbSiiY\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 79044,
		"path": "../public/assets/expenses-BPAcKO1A.png"
	},
	"/assets/exports-CCIPnAuG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"234a-o40fY7OYTqv3v9fAVmguZDgoIzQ\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 9034,
		"path": "../public/assets/exports-CCIPnAuG.js"
	},
	"/assets/exports-jyb2k9sj.png": {
		"type": "image/png",
		"etag": "\"b89e-RpTzujoK0jR+2nK6PCMiVNcs/+8\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 47262,
		"path": "../public/assets/exports-jyb2k9sj.png"
	},
	"/assets/fields-DyZziUFr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15e8-yo9acAHHMl+x6zOOMF33wfKga2s\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 5608,
		"path": "../public/assets/fields-DyZziUFr.js"
	},
	"/assets/home-DDjJczyk.png": {
		"type": "image/png",
		"etag": "\"18c0f-5HjfzQHR7vCpirXC0lsaciqOBNY\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 101391,
		"path": "../public/assets/home-DDjJczyk.png"
	},
	"/assets/image-SR7yzIDr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"109-thRvYANqbJ3OpK+SB9LuE+C4dgU\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 265,
		"path": "../public/assets/image-SR7yzIDr.js"
	},
	"/assets/images-Br7BL4Al.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30a-E4m/HJAwphtRZXjSJOIPjiV5qNg\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 778,
		"path": "../public/assets/images-Br7BL4Al.js"
	},
	"/assets/index-DYqILWYF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4813b-qK5iFk3zOxlT2bUnEyBmS6aJFOU\"",
		"mtime": "2026-08-18T01:11:47.256Z",
		"size": 295227,
		"path": "../public/assets/index-DYqILWYF.js"
	},
	"/assets/inventory-B7_DSITP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ca1-8lVx7L7iaFbMfI7U/a3ETJXk8WA\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 7329,
		"path": "../public/assets/inventory-B7_DSITP.js"
	},
	"/assets/inventory-BZ23KCWH.png": {
		"type": "image/png",
		"etag": "\"1cd13-x1omMicojf+fbykcv+9qFjUWEJ0\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 118035,
		"path": "../public/assets/inventory-BZ23KCWH.png"
	},
	"/assets/invoices-C_7ynItR.png": {
		"type": "image/png",
		"etag": "\"14dd2-gtVf4mkfg56SshbseU4RIgJ+08c\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 85458,
		"path": "../public/assets/invoices-C_7ynItR.png"
	},
	"/assets/lazyRouteComponent-DlmqQnT3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e93-jUg42EsEJowSSc9s91TojLfXQ2U\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 3731,
		"path": "../public/assets/lazyRouteComponent-DlmqQnT3.js"
	},
	"/assets/login-banner-C34myJHx.jpg": {
		"type": "image/jpeg",
		"etag": "\"1e45d-JL3SqIVyAJr9rfwAHLvMKhtbMVI\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 123997,
		"path": "../public/assets/login-banner-C34myJHx.jpg"
	},
	"/assets/login-banner-nVQaUQCy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7078-hQv1SZeNu6o15K81zFTrwcuStj4\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 28792,
		"path": "../public/assets/login-banner-nVQaUQCy.js"
	},
	"/assets/logo-BLBh_Cfa.png": {
		"type": "image/png",
		"etag": "\"4263c-Yjed2yM/Y41Ze2/Ad9inyWLODrE\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 271932,
		"path": "../public/assets/logo-BLBh_Cfa.png"
	},
	"/assets/message-circle-BhgAkBFg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed-1X+tmqpNGEjADTVZhgeuHE2E+Kw\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 237,
		"path": "../public/assets/message-circle-BhgAkBFg.js"
	},
	"/assets/messages-96fDhSmy.png": {
		"type": "image/png",
		"etag": "\"e876-ZFgUYotHZgInybRanjMvczsssKE\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 59510,
		"path": "../public/assets/messages-96fDhSmy.png"
	},
	"/assets/messages-mAq_zkla.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ba1-9f9XP+LqUWQ1AZ0LoOjpGQkMUNY\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 19361,
		"path": "../public/assets/messages-mAq_zkla.js"
	},
	"/assets/new-D-WeTQ0d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d-hCrRzNKKMcoFYf+eiYHwE48lZyQ\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 2829,
		"path": "../public/assets/new-D-WeTQ0d.js"
	},
	"/assets/new-DJ2FWdTh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf2-GkdR+TcGDG6WhbqCRJWC/mcCp+o\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 3058,
		"path": "../public/assets/new-DJ2FWdTh.js"
	},
	"/assets/new-Itb8e0Mk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103e-uLRzJnT7zSODHUNJPZT85OqUhWI\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 4158,
		"path": "../public/assets/new-Itb8e0Mk.js"
	},
	"/assets/notifications-BMACoHBr.png": {
		"type": "image/png",
		"etag": "\"cb2a-UUcinjAu0qtYNwNUZFt3kYQlmVM\"",
		"mtime": "2026-08-18T01:11:47.259Z",
		"size": 52010,
		"path": "../public/assets/notifications-BMACoHBr.png"
	},
	"/assets/notifications-CckTmB7n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2c-5580mXerpDzZqvCnfSyW60NTAlU\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 3372,
		"path": "../public/assets/notifications-CckTmB7n.js"
	},
	"/assets/palette-Bpuq6Mtq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1fa-OpNd9cp1yStcsE4uJpOeTUrE0C0\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 506,
		"path": "../public/assets/palette-Bpuq6Mtq.js"
	},
	"/assets/pencil-13D3LDCL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"110-uVUAAHKYoy7ql1NIY5rY31o1sXE\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 272,
		"path": "../public/assets/pencil-13D3LDCL.js"
	},
	"/assets/people-D4Zs_vdu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-xGnTMCseXX0rhmHBF+j+9ivIspc\"",
		"mtime": "2026-08-18T01:11:47.257Z",
		"size": 411,
		"path": "../public/assets/people-D4Zs_vdu.js"
	},
	"/assets/permissions-BQuQ7CPM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d5-ZFbLbqpHeqFtZsRl4hHRHoWPXHc\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 213,
		"path": "../public/assets/permissions-BQuQ7CPM.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/purchase-invoices-D-4bh1Yn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1210-yysjC/zsYndv8ciRYLXP2iyy8/0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 4624,
		"path": "../public/assets/purchase-invoices-D-4bh1Yn.js"
	},
	"/assets/purchases-MWoGNJMu.png": {
		"type": "image/png",
		"etag": "\"f192-jphsIm9FtLX2Wx3Lae+Ag3LzoiE\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 61842,
		"path": "../public/assets/purchases-MWoGNJMu.png"
	},
	"/assets/reports-CI4zVq6y.png": {
		"type": "image/png",
		"etag": "\"5e8b-MAf+mH0TcdCixH5F+f4dIo4FD5s\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 24203,
		"path": "../public/assets/reports-CI4zVq6y.png"
	},
	"/assets/reports-iyvX-8Jk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fdb-cFIfewtYaDrQvSrYCYgvqKImFE0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 4059,
		"path": "../public/assets/reports-iyvX-8Jk.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/rotate-ccw-BrY1-ma2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c4-CfnTm30Q7rgf/RC7WJKwCgF/xw8\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 196,
		"path": "../public/assets/rotate-ccw-BrY1-ma2.js"
	},
	"/assets/routes-DCPXZeDo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"193c-np6F5g+IbkWZPpmR1rMFUN96so8\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 6460,
		"path": "../public/assets/routes-DCPXZeDo.js"
	},
	"/assets/ruler-CWBJ_Ew6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a-Spynqo36Lyd1w4X7ckkWGdO1hTQ\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 394,
		"path": "../public/assets/ruler-CWBJ_Ew6.js"
	},
	"/assets/search-Bg4i3lWh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-pphAgWT4m0O7ZVUVb8eFteI3lc0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 170,
		"path": "../public/assets/search-Bg4i3lWh.js"
	},
	"/assets/send-B7ANjQlm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11e-QedpBYU8u74Q2xs39MFyDJqDXK0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 286,
		"path": "../public/assets/send-B7ANjQlm.js"
	},
	"/assets/settings-CoPbJE01.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e3-w0/Ih1Kn3Spza7Cxw2iiGnqJgKM\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 483,
		"path": "../public/assets/settings-CoPbJE01.js"
	},
	"/assets/settings-D-looumG.png": {
		"type": "image/png",
		"etag": "\"185c7-ffqItnIRqY3jxwED24ynJGLtubo\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 99783,
		"path": "../public/assets/settings-D-looumG.png"
	},
	"/assets/settings-vTGsfkq2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6712-Hx2UG91iNgfF7/uB3gSDtjgQ2Qk\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 26386,
		"path": "../public/assets/settings-vTGsfkq2.js"
	},
	"/assets/shield-ClH9F5lg.png": {
		"type": "image/png",
		"etag": "\"bf92-mi0ce/wkmqeoX0FyuunxpqjLrkY\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 49042,
		"path": "../public/assets/shield-ClH9F5lg.png"
	},
	"/assets/shield-alert-vJe_giev.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"285-p6bnESnbcn7hV+ax0NFT4YIjqzY\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 645,
		"path": "../public/assets/shield-alert-vJe_giev.js"
	},
	"/assets/shield-check-DH81hNaA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-XPayHUYYrDhnL6Sz+yW5ASTBsz0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 316,
		"path": "../public/assets/shield-check-DH81hNaA.js"
	},
	"/assets/shopping-cart-BAmLHayt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"120-mkVbN+5UwrdBih4EJgiZdEP0Drw\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 288,
		"path": "../public/assets/shopping-cart-BAmLHayt.js"
	},
	"/assets/store-TDIUkdVt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4e259-7k75z1nXY/6usB5gnLvplRwOaAw\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 320089,
		"path": "../public/assets/store-TDIUkdVt.js"
	},
	"/assets/styles-Bg8UQGhq.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17492-2g6OOoFgmcITQ5+7tRZuVTwGqgM\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 95378,
		"path": "../public/assets/styles-Bg8UQGhq.css"
	},
	"/assets/tasks-B3oQ8xrZ.png": {
		"type": "image/png",
		"etag": "\"12a35-6k8QNuc5g6sCnnCI9XjRxOY+oRc\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 76341,
		"path": "../public/assets/tasks-B3oQ8xrZ.png"
	},
	"/assets/tasks-CX6dyP9D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f44-795GwRVMgKO/FlIwDYICYXl8DYk\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 8004,
		"path": "../public/assets/tasks-CX6dyP9D.js"
	},
	"/assets/trash-2-D6Z88JaX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"144-SLKMpywNbxBcMepcv4m5ufVnnhc\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 324,
		"path": "../public/assets/trash-2-D6Z88JaX.js"
	},
	"/assets/trending-up-0bpRk6BA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-/fYrz16ZOnRzw0Who94z9IWYzs0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 171,
		"path": "../public/assets/trending-up-0bpRk6BA.js"
	},
	"/assets/ui-kit-CuRlv5rK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f340-Z9esVmRdbKtqtYdCa1Frq1JnCJs\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 62272,
		"path": "../public/assets/ui-kit-CuRlv5rK.js"
	},
	"/assets/use-fake-loading-OJu1yTik.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-rQk6I1ZmdNIRtz22bbexGg4Dtv4\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 259,
		"path": "../public/assets/use-fake-loading-OJu1yTik.js"
	},
	"/assets/useParams-DXmgsa4N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"108-BfHwSelOg2DWnUrscDZ1Ac+xKeU\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 264,
		"path": "../public/assets/useParams-DXmgsa4N.js"
	},
	"/assets/useRouterState-CJVZESg6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5d2a-tXxQmP2MUQ9H8xFQl5UtQWQd+pA\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 23850,
		"path": "../public/assets/useRouterState-CJVZESg6.js"
	},
	"/assets/useSearch-DE7Xl8bZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e0-dc9zBp7KT/7wGx5o/cI64Qs5Bbg\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 224,
		"path": "../public/assets/useSearch-DE7Xl8bZ.js"
	},
	"/assets/user-plus-BJQPUWGw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132-WDAj8998aRqnkZmEtuZONO/AhnU\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 306,
		"path": "../public/assets/user-plus-BJQPUWGw.js"
	},
	"/assets/users-C_dnQ6vj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40ce-lu4AzGPHVVtBRE96YamnNlsEGk0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 16590,
		"path": "../public/assets/users-C_dnQ6vj.js"
	},
	"/assets/users-CpAoyfeU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12e-lcuhRvxPiUWn0cgDGeke7QP/Shs\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 302,
		"path": "../public/assets/users-CpAoyfeU.js"
	},
	"/assets/users-YmUS8wse.png": {
		"type": "image/png",
		"etag": "\"7e68-01w4pNgg/swcPf1OCNSAjfTxaR0\"",
		"mtime": "2026-08-18T01:11:47.260Z",
		"size": 32360,
		"path": "../public/assets/users-YmUS8wse.png"
	},
	"/assets/wallet-sA_bHisc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11a-VhZ2aR1gYFhhMeY+cwAv3voUkE0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 282,
		"path": "../public/assets/wallet-sA_bHisc.js"
	},
	"/assets/web-Bsnuc7rd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"353-iSyCF/G1S0eT/SLpiCTgL5Gnzpc\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 851,
		"path": "../public/assets/web-Bsnuc7rd.js"
	},
	"/assets/wrench-zhBupfc4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12b-44VvUlOF3ZLPum/drMvLPxIdJK0\"",
		"mtime": "2026-08-18T01:11:47.258Z",
		"size": 299,
		"path": "../public/assets/wrench-zhBupfc4.js"
	},
	"/icons/icon-192.png": {
		"type": "image/png",
		"etag": "\"a1a6-nW+KHInzNfPyzDv8jB4vnJRrrWE\"",
		"mtime": "2026-08-18T01:11:51.353Z",
		"size": 41382,
		"path": "../public/icons/icon-192.png"
	},
	"/icons/icon-512.png": {
		"type": "image/png",
		"etag": "\"4263c-Yjed2yM/Y41Ze2/Ad9inyWLODrE\"",
		"mtime": "2026-08-18T01:11:51.354Z",
		"size": 271932,
		"path": "../public/icons/icon-512.png"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_IO091Z = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_IO091Z
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
