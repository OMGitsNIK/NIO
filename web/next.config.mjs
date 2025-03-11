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
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	  },
};

export default nextConfig;
