import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md" role="alert">
        <div className="text-7xl font-bold text-gray-300" aria-hidden="true">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Page not found</h1>
        <p className="mt-2 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 text-white px-6 py-2.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
