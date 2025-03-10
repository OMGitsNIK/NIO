/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "8000",
				pathname: "/v1/bucket/**",
			},
			{
				protocol: "http",
				hostname: "172.26.28.197",
				port: "8000",
				pathname: "/v1/bucket/**",
			},
		],
	},
};

export default nextConfig;
