import { Link } from 'react-router-dom';
import { RegisterForm } from '../../components/auth/RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex justify-center items-center">
      <div className="w-full max-w-md bg-white px-6 py-8 shadow-xl rounded-xl transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create a new account</h2>
        
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>

        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}