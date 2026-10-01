import { isIP } from "node:net";

export function getClientIp(headers: Headers): string | null {
  const candidate =
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (candidate && isIP(candidate)) {
    const mappedIpv4 = candidate.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)?.[1];
    return mappedIpv4 && isIP(mappedIpv4) === 4 ? mappedIpv4 : candidate.toLowerCase();
  }

  return process.env.NODE_ENV === "development" ? "127.0.0.1" : null;
}
