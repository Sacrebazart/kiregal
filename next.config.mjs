/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/faceoff",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
