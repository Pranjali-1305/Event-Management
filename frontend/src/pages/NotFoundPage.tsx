import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
    <div className="text-8xl font-extrabold text-primary-200 dark:text-primary-900 mb-4">404</div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
    <p className="text-gray-500 dark:text-gray-400 mb-8">
      The page you're looking for doesn't exist.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
    >
      Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
