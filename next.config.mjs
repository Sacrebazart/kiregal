/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/kiregal",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
