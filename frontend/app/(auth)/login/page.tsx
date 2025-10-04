'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

// A simple SVG for the Google icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.196C34.978 5.617 29.862 3.5 24 3.5C13.787 3.5 5.5 11.787 5.5 22S13.787 40.5 24 40.5c10.455 0 19.339-8.327 19.611-18.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c-2.313 4.212-3.32 9.091-2.43 14.123L16.22 20.825L6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 40.5c5.317 0 10.057-2.122 13.488-5.644L33.72 27.642C31.25 29.623 27.82 30.5 24 30.5c-5.91 0-10.957-3.328-13.189-8.224l-9.143 6.914C8.981 35.798 15.986 40.5 24 40.5z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.14-4.082 5.568L44.453 38.13C46.883 34.225 48 29.37 48 24c0-2.119-.301-4.16-.857-6.083z"></path>
  </svg>
);

// A simple SVG for the GitHub icon
const GitHubIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Use 'username' from the form for the API
    const payload = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password. Please try again.');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      // Clear any cached profile data to ensure fresh fetch
      localStorage.removeItem('userProfile');
      console.log('Login - Cleared cached profile data');
      
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-blue-600 text-white font-bold text-xl rounded-lg">S</div>
            <h1 className="text-2xl font-bold text-black">Welcome to SaaS Manager</h1>
            <p className="text-black">Sign in to your account or create a new one</p>
        </div>

        {/* Login/Sign Up Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
            <button className="px-4 py-2 text-center text-sm font-medium text-blue-700 bg-white rounded-md shadow-sm">
                Login
            </button>
            <Link href="/register" className="px-4 py-2 text-center text-sm font-medium text-black rounded-md hover:bg-gray-200">
                Sign Up
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-black">Username</label>
                <input type="text" name="username" id="username" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500" placeholder="Enter your username"/>
            </div>
            <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
                <input 
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
                    placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded"/>
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-black">Remember me</label>
                </div>
                <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div>
                <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
            </div>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-black">OR CONTINUE WITH</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50">
                <GoogleIcon /> Google
            </button>
            <button className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50">
                <GitHubIcon /> GitHub
            </button>
        </div>

        <p className="text-center text-sm text-black">
            Don't have an account? <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
        </p>
    </div>
  );
}

