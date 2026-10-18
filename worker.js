// Branded domain proxy worker for jopelpay.site
// One Worker handles all three branded subdomains (checkout, dashboard, api).
// Deploy this on your own Cloudflare zone, then add three Worker Routes:
//   checkout.jopelpay.site/*
//   dashboard.jopelpay.site/*
//   api.jopelpay.site/*
// Nothing changes in your dashboard — this file is auto-generated.

const ORIGIN = "cname.rampex.io"; // platform SaaS edge
const HOSTS = new Set([
  "checkout.jopelpay.site",
  "dashboard.jopelpay.site",
  "api.jopelpay.site",
]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const incomingHost = (request.headers.get("host") || "").toLowerCase();

    if (!HOSTS.has(incomingHost)) {
      return new Response("Unknown host", { status: 421 });
    }

    url.hostname = ORIGIN;
    url.protocol = "https:";
    url.port = "";

    const headers = new Headers(request.headers);
    // SNI + Host must match the SaaS edge so the right certificate is served.
    headers.set("host", ORIGIN);
    // Preserve the branded hostname so our worker can resolve the master.
    headers.set("x-forwarded-host", incomingHost);
    headers.set("x-forwarded-proto", "https");
    // Marker so platform verification can confirm the Worker is in front.
    headers.set("x-rampex-proxy", "1");

    const init = {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "manual",
    };

    return fetch(new Request(url.toString(), init));
  },
};
