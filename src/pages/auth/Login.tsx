import { Link } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex justify-center items-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl transform transition-all duration-500 hover:scale-105">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 animate__animated animate__fadeIn">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-all duration-200"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}