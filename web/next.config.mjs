/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns:[{protocol:'http',hostname:'localhost',port:'8000',pathname:'/bucket/image/**'}]
    }
};

export default nextConfig;
