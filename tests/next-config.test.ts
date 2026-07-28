import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import nextConfig, { getLocalDevOrigins } from "../next.config";

describe("mobile development origins", () => {
  it("collects unique non-internal IPv4 addresses", () => {
    expect(
      getLocalDevOrigins({
        en0: [
          {
            address: "192.168.0.6",
            netmask: "255.255.255.0",
            family: "IPv4",
            mac: "00:00:00:00:00:00",
            internal: false,
            cidr: "192.168.0.6/24",
          },
          {
            address: "fe80::1",
            netmask: "ffff:ffff:ffff:ffff::",
            family: "IPv6",
            mac: "00:00:00:00:00:00",
            internal: false,
            cidr: "fe80::1/64",
            scopeid: 4,
          },
        ],
        lo0: [
          {
            address: "127.0.0.1",
            netmask: "255.0.0.0",
            family: "IPv4",
            mac: "00:00:00:00:00:00",
            internal: true,
            cidr: "127.0.0.1/8",
          },
        ],
        bridge: [
          {
            address: "192.168.0.6",
            netmask: "255.255.255.0",
            family: "IPv4",
            mac: "00:00:00:00:00:01",
            internal: false,
            cidr: "192.168.0.6/24",
          },
        ],
      }),
    ).toEqual(["localhost", "127.0.0.1", "192.168.0.6"]);
  });

  it("places discovered LAN addresses in Next's development allowlist", () => {
    expect(nextConfig.allowedDevOrigins).toEqual(getLocalDevOrigins());
  });

  it("keeps custom Next output out of Tailwind source discovery", () => {
    const ignoreRules = readFileSync(".gitignore", "utf8");
    expect(ignoreRules).toContain("/.next-*/");
  });

  it("sets baseline production security headers", async () => {
    const groups = await nextConfig.headers?.();
    const headers = Object.fromEntries(
      (groups?.[0].headers ?? []).map((header) => [
        header.key,
        header.value,
      ]),
    );
    expect(headers).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    });
  });
});
