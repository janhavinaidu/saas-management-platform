'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

const RoleSelector = ({
    value,
    checked,
    onChange,
    label,
    description
}: {
    value: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    description: string;
}) => (
    <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
        checked ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:border-gray-400'
    }`}>
        <input
            type="radio"
            name="role"
            value={value}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <div className="ml-3 text-sm">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-gray-500">{description}</p>
        </div>
    </label>
);

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('USER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password,
            role: selectedRole
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Registration failed. Try again.");
            }

            alert("Account created successfully! Please log in.");
            router.push('/login');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200 my-10">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-black">Create a New Account</h1>
                <p className="text-black">Join the SaaS Management Platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-black">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            required
                            className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-black"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            required
                            className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-black"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <p className="text-sm font-medium text-black">Choose your role</p>

                    <RoleSelector
                        value="USER"
                        checked={selectedRole === 'USER'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        label="Employee"
                        description="Request licenses and access apps"
                    />

                    <RoleSelector
                        value="DEPT_HEAD"
                        checked={selectedRole === 'DEPT_HEAD'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        label="Department Head"
                        description="Manage team resources"
                    />

                    <RoleSelector
                        value="ADMIN"
                        checked={selectedRole === 'ADMIN'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        label="Admin"
                        description="Full system management"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                </div>
            </form>

            <p className="text-center text-sm text-black">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
