import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

type NetworkMap = ReturnType<typeof networkInterfaces>;

export function getLocalDevOrigins(interfaces: NetworkMap = networkInterfaces()) {
  return Array.from(
    new Set(
      [
        "localhost",
        "127.0.0.1",
        ...Object.values(interfaces)
          .flatMap((addresses) => addresses ?? [])
          .filter(
            (address) =>
              address.family === "IPv4" &&
              !address.internal &&
              Boolean(address.address),
          )
          .map((address) => address.address),
      ],
    ),
  );
}

const nextConfig: NextConfig = {
  // Next 16 blocks dev assets requested through a different hostname. Allow
  // this computer's current LAN addresses so phones on the same Wi-Fi can
  // hydrate the app instead of remaining on the server-rendered loader.
  allowedDevOrigins: getLocalDevOrigins(),
};

export default nextConfig;
