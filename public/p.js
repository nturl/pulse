// Pulse tracker. Usage on any site:
//   <script defer data-site="topsail" src="https://<pulse-host>/p.js"></script>
// Sends a pageview on load and on SPA navigations.
(() => {
  const el = document.currentScript;
  const site = el && el.dataset.site;
  if (!site) return;
  const endpoint = el.src.replace(/p\.js.*$/, "api/t");
  let last = "";
  const send = () => {
    const path = location.pathname;
    if (path === last) return;
    last = path;
    const body = JSON.stringify({ s: site, p: path, r: document.referrer || "" });
    if (!(navigator.sendBeacon && navigator.sendBeacon(endpoint, body))) {
      fetch(endpoint, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  };
  send();
  const push = history.pushState;
  history.pushState = function () {
    push.apply(this, arguments);
    send();
  };
  addEventListener("popstate", send);
})();
