/**
 * Demo credentials box - only shown in development or when ENABLE_DEMO_MODE is set.
 * Hidden in production for security.
 */
export function DemoCredentialsBox() {
  const isDemoMode =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_DEMO_MODE === 'true'

  if (!isDemoMode) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
      <p className="font-medium text-gray-700">Demo accounts</p>
      <p className="mt-1">
        Trainer: <code className="rounded bg-gray-200 px-1 py-0.5 text-gray-800">trainer@demo.com</code>
        {' · '}
        Trainee: <code className="rounded bg-gray-200 px-1 py-0.5 text-gray-800">trainee@demo.com</code>
      </p>
      <p className="mt-1">Password: <code className="rounded bg-gray-200 px-1 py-0.5 text-gray-800">demo123</code></p>
    </div>
  )
}
