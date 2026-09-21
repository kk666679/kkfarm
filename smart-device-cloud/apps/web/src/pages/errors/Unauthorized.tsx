import { Link } from 'react-router-dom';

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="mt-4 text-xl text-gray-600">Unauthorized access</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-blue-600 text-white px-4 py-2">
          Go home
        </Link>
      </div>
    </div>
  );
}
