// Only trust a measured, fixed number of reverse proxy hops.
export const configureTrustProxy = (app, value = process.env.TRUST_PROXY_HOPS) => {
  const hops = value === undefined || value === "" ? "0" : String(value);
  if (!/^\d+$/.test(hops) || !Number.isSafeInteger(Number(hops))) {
    throw new Error("TRUST_PROXY_HOPS must be a non-negative safe integer");
  }
  app.set("trust proxy", Number(hops));
};
