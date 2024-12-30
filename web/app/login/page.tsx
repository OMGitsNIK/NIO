
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {


  return (
    <div className="flex min-h-screen">
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-white text-black">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full bg-gradient-to-br from-teal-400 to-purple-500"
            />
            <h2 className="mt-6 text-2xl font-bold">Welcome Back</h2>
            <p className="text-sm text-gray-600">Great you see you back here</p>
          </div>

          <form className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Create One
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-400">
        <div className="flex h-full justify-center px-12 py-12">
          <h1 className="text-7xl font-light text-white leading-tight">
            A Faster Way To Gain Insights on Aquatic Images
          </h1>
        </div>
      </div>
    </div>
  )
}

