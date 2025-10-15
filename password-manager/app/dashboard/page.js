    "use client";
    import { FaGlobe, FaUser, FaLock, FaCopy, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
    import { MdDoNotDisturbAlt } from "react-icons/md";
    import { IoAddSharp, IoSearch } from "react-icons/io5";
    import { useState, useEffect } from 'react';
    import { useSession, signOut } from 'next-auth/react';
    import { useRouter } from 'next/navigation';
    import PasswordForm from '@/components/PasswordForm';
    import { ToastContainer, toast } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';

    const Dashboard = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isSearching, setIsSearching] = useState(false);
    const [passwords, setPasswords] = useState([]);
    const [filteredPasswords, setFilteredPasswords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPassword, setEditingPassword] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

    useEffect(() => {
        if (status === 'unauthenticated') {
        router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
    if (session) {
        fetchPasswords();
    }
}, [session, fetchPasswords]);


    useEffect(() => {
        if (searchTerm === '') {
        setIsSearching(true);
        const timeout = setTimeout(() => {
            setFilteredPasswords(passwords);
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timeout);
        } else {
        setIsSearching(true);
        const timeout = setTimeout(() => {
            const filtered = passwords.filter(password =>
            password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
            password.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPasswords(filtered);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timeout);
        }
    }, [searchTerm, passwords]);

    const fetchPasswords = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/passwords', {
            headers: { 'Authorization': `Bearer ${session.user.id}` }
        });
        if (response.ok) {
            const data = await response.json();
            setPasswords(data);
            setFilteredPasswords(data);
        }
    } catch (error) {
        setDeleteError('Error fetching passwords');
    } finally {
        setIsLoading(false);
    }
}, [session]);


    // const handleLogout = () => {
    //     signOut({ callbackUrl: '/' });
    // };

    const handlePasswordAdded = () => {
        setShowForm(false);
        setEditingPassword(null);
        fetchPasswords();
    };

    const confirmDelete = (passwordId) => {
        setDeleteConfirm({ show: true, id: passwordId });
    };

    const handleDelete = async () => {
        if (!session || !session.user || !deleteConfirm.id) {
        setDeleteError('Authentication error. Please log in again.');
        setDeleteConfirm({ show: false, id: null });
        return;
        }

        setIsDeleting(true);
        setDeleteError(null);
        try {
        const response = await fetch(`/api/passwords/${deleteConfirm.id}`, {
            method: 'DELETE',
            headers: {
            'Authorization': `Bearer ${session.user.id}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            setPasswords(prev => prev.filter(p => p._id !== deleteConfirm.id));
            setFilteredPasswords(prev => prev.filter(p => p._id !== deleteConfirm.id));
            toast.success("Password deleted successfully!"); 
        } else {
            setDeleteError(data.message || data.error || 'Failed to delete password');
            toast.error("Failed to delete password!"); 
        }
        } catch (error) {
        setDeleteError(`Network error: ${error.message || 'Unable to connect to server'}`);
        toast.error("Network error while deleting password!"); 
        } finally {
        setIsDeleting(false);
        setDeleteConfirm({ show: false, id: null });
        }
    };

    const handleEdit = (password) => {
        setEditingPassword(password);
        setShowForm(true);
    };

    const PasswordCard = ({ password, onEdit, onDelete }) => {
        const [showPassword, setShowPassword] = useState(false);
        const [copiedField, setCopiedField] = useState(null);

        const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        };

        return (
        <div className="bg-[#1a1a1d] rounded-xl p-6 shadow-lg border border-gray-700 hover:border-[#6C5CE7] transition-all duration-300 transform hover:-translate-y-1">
            
            <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="bg-button-gradient w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <FaGlobe className="text-white" />
                </div>
                <h2 className="text-xl font-semibold">{password.website}</h2>
            </div>
            <div className="flex space-x-2">
                <button
                onClick={() => onEdit(password)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Edit password"
                >
                <FaEdit />
                </button>
                <button
                onClick={() => onDelete(password._id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Delete password"
                >
                <FaTrash />
                </button>
            </div>
            </div>

            <div className="space-y-4">
            <div className="flex items-center justify-between p-1 rounded-lg">
                <div className="flex items-center">
                <FaUser className="text-gray-400 mr-3" />
                <div>
                    <p className="text-gray-400 text-xs">Username</p>
                    <p className="truncate max-w-[180px]">{password.username}</p>
                </div>
                </div>
                <button
                onClick={() => handleCopy(password.username, 'username')}
                className={`p-2 rounded-full ${copiedField === 'username' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                aria-label="Copy username"
                >
                {copiedField === 'username' ? '✓' : <FaCopy />}
                </button>
            </div>
            <div className="flex items-center justify-between p-1 rounded-lg">
                <div className="flex items-center">
                <FaLock className="text-gray-400 mr-3" />
                <div>
                    <p className="text-gray-400 text-xs">Password</p>
                    <p className="truncate max-w-[180px]">
                    {showPassword ? password.password : '•'.repeat(12)}
                    </p>
                </div>
                </div>
                <div className="flex space-x-2">
                <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                    onClick={() => handleCopy(password.password, 'password')}
                    className={`p-2 rounded-full ${copiedField === 'password' ? 'bg-green-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                    aria-label="Copy password"
                >
                    {copiedField === 'password' ? '✓' : <FaCopy />}
                </button>
                </div>
            </div>
            </div>

            {password.notes && (
            <div className="mt-4 p-1 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Notes</p>
                <p className="text-sm">{password.notes}</p>
            </div>
            )}
            <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
            <span>Created: {new Date(password.createdAt).toLocaleDateString()}</span>
            <span className="bg-button-gradient text-white px-2 py-1 rounded">
                {password.website.charAt(0).toUpperCase()}
            </span>
            </div>
        </div>
        );
    };

    if (status === "loading" || isLoading) {
        return (
        <div className="min-h-screen bg-primary-gradient flex items-center justify-center px-4">
            <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-gradient text-white">
            <ToastContainer 
            position="top-right"
            autoClose={2000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            theme="dark"
        />
        <div className="min-h-screen container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center lg:px-20 md:items-center mb-8 gap-4 mt-20">
            <div>
                <h1 className="text-2xl font-bold">Password Vault</h1>
                <p className="text-gray-400">Welcome {session?.user?.name}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="Search passwords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a1d] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
                />
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                onClick={() => {
                    setEditingPassword(null);
                    setShowForm(true);
                }}
                className="bg-button-gradient hover:opacity-90 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                <IoAddSharp />
                Add Password
                </button>
            </div>
            </div>

            {deleteError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200 flex items-center">
                <FaTrash className="mr-2" />
                <span>Error: {deleteError}</span>
                <button
                onClick={() => setDeleteError(null)}
                className="ml-auto text-red-400 hover:text-red-200"
                >
                ×
                </button>
            </div>
            )}

            {showForm && (
            <PasswordForm
                onClose={() => {
                setShowForm(false);
                setEditingPassword(null);
                }}
                onPasswordAdded={handlePasswordAdded}
                editingPassword={editingPassword}
            />
            )}

            {isSearching ? (
            <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Searching...</p>
            </div>
            ) : filteredPasswords.length === 0 ? (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-[#1a1a1d] rounded-full flex items-center justify-center mb-4">
                <MdDoNotDisturbAlt className="text-3xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No passwords found</h3>
                <p className="text-gray-400 mb-4">Add your first password to get started</p>
                <button
                onClick={() => {
                    setEditingPassword(null);
                    setShowForm(true);
                }}
                className="bg-button-gradient hover:opacity-90 px-4 py-2 rounded-lg transition"
                >
                Add Password
                </button>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:ml-20 lg:mr-20 gap-6">
                {filteredPasswords.map((password) => (
                <PasswordCard
                    key={password._id}
                    password={password}
                    onEdit={handleEdit}
                    onDelete={confirmDelete}
                />
                ))}
            </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirm.show && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1d] p-6 rounded-xl text-center w-auto shadow-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-white">
                    Confirm Deletion
                </h3>
                <p className="text-gray-400 mb-6">
                    Are you sure you want to delete this password? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                    onClick={() => setDeleteConfirm({ show: false, id: null })}
                    className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
                    >
                    OK
                    </button>
                </div>
                </div>
            </div>
            )}

            {isDeleting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1d] p-6 rounded-xl text-center">
                <div className="w-12 h-12 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Deleting password...</p>
                </div>
            </div>
            )}
        </div>
        </div>
    );
    };

    export default Dashboard;
