import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save } from 'lucide-react';
import UserDashboardLayout from '../layouts/UserDashboardLayout';

const UserProfile = () => {
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Demo User',
        email: 'user@aegisai.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, San Francisco, CA 94102',
        dateOfBirth: '1990-01-15',
        employmentStatus: 'Full-Time',
        annualIncome: 75000,
        creditScore: 720
    });

    const handleSave = () => {
        // In production, this would call an API to update the profile
        setEditing(false);
        // Show success message
        alert('Profile updated successfully!');
    };

    return (
        <UserDashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">My Profile</h1>
                        <p className="text-secondary mt-1">Manage your personal information</p>
                    </div>
                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        <span className="font-semibold">{editing ? 'Save Changes' : 'Edit Profile'}</span>
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-gradient-to-r from-primary to-primary/80 text-white">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                                {profile.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <p className="text-white/80 mt-1">{profile.email}</p>
                                <div className="flex items-center space-x-4 mt-3">
                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                        Credit Score: {profile.creditScore}
                                    </div>
                                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                        {profile.employmentStatus}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={profile.dateOfBirth}
                                            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                                            disabled={!editing}
                                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            disabled={!editing}
                                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.address}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            disabled={!editing}
                                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Financial Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Status</label>
                                    <select
                                        value={profile.employmentStatus}
                                        onChange={(e) => setProfile({ ...profile, employmentStatus: e.target.value })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                    >
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Self-Employed">Self-Employed</option>
                                        <option value="Unemployed">Unemployed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Income ($)</label>
                                    <input
                                        type="number"
                                        value={profile.annualIncome}
                                        onChange={(e) => setProfile({ ...profile, annualIncome: parseInt(e.target.value) })}
                                        disabled={!editing}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Score</label>
                                    <input
                                        type="number"
                                        value={profile.creditScore}
                                        disabled
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Credit score is updated automatically</p>
                                </div>
                            </div>
                        </div>

                        {editing && (
                            <div className="flex space-x-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserDashboardLayout>
    );
};

export default UserProfile;
