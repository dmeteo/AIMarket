import type { NextConfig } from "next";

const useMockApi = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true'

const nextConfig: NextConfig = {
	// When mock API is disabled, proxy requests to backend to avoid CORS
	rewrites: useMockApi
		? undefined
		: async () => [
			{
				source: '/api/:path*',
				destination: `${process.env.BACKEND_API_URL || 'http://localhost:8000'}/api/:path*`,
			},
		],
}

export default nextConfig
