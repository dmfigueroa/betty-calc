import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { cache } from "hono/cache";

const app = new Hono();

const route = app.basePath("api").get(
  "/currencies",
  cache({
    cacheName: "betty-currencies",
    cacheControl: "max-age=600",
  }),
  async (c) => {
    const conversionsResponse = await fetch(
      "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cop.json"
    );
    const conversionsData = await conversionsResponse.json();
    const conversions = conversionsData.cop;

    return c.json({
      usd: conversions["00"] as number,
      hnl: conversions["hnl"] as number,
    });
  }
);

export type AppType = typeof route;

export const onRequest = handle(app);
