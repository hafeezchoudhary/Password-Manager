"use client";
import { useState, useEffect } from 'react';
import { FaGlobe, FaUser, FaLock, FaStickyNote, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const PasswordForm = ({ onClose, onPasswordAdded, editingPassword }) => {
    const { data: session } = useSession();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        website: '',
        username: '',
        password: '',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Update form data when editingPassword changes
    useEffect(() => {
        if (editingPassword) {
            console.log('Setting form data for editing:', editingPassword);
            setFormData({
                website: editingPassword.website || '',
                username: editingPassword.username || '',
                password: editingPassword.password || '',
                notes: editingPassword.notes || ''
            });
        } else {
            // Reset form when adding a new password
            setFormData({
                website: '',
                username: '',
                password: '',
                notes: ''
            });
        }
    }, [editingPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const url = editingPassword
                ? `/api/passwords/${editingPassword._id}`
                : '/api/passwords';

            const method = editingPassword ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.id}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                onPasswordAdded();
            } else {
                const errorMessage = data.error || 'Failed to save password';
                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1d] rounded-xl w-full max-w-md border border-gray-700">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">
                            {editingPassword ? 'Edit Password' : 'Add New Password'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Website
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaGlobe className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 bg-[#0f0f10] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                                        placeholder="example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 bg-[#0f0f10] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                                        placeholder="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-500" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}   // toggle text/password
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-10 py-2 bg-[#0f0f10] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Notes (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                        <FaStickyNote className="text-gray-500 mt-0.5" />
                                    </div>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 bg-[#0f0f10] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:bg-[#5a4fd1] rounded-lg transition flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    editingPassword ? 'Update Password' : 'Add Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordForm;