// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/api';

// ============================================================================
// Component
// ============================================================================
export default function Profile() {
    // ============================================================================
    // State
    // ============================================================================
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        username: '',
        profilePicture: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    // ============================================================================
    // Effects
    // ============================================================================
    useEffect(() => {
        fetchProfile();
    }, []);

    // ============================================================================
    // API Calls
    // ============================================================================
    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/me`, {
                headers: {
                    'user-id': user?.id || '',
                },
            });
            const data = await response.json();
            setProfile({
                name: data.name || '',
                email: data.email,
                username: data.username || '',
                profilePicture: data.profilePicture || '',
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    // ============================================================================
    // Event Handlers
    // ============================================================================
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || '',
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) throw new Error('Update failed');

            await refreshUser();
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/users/me/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || '',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Password change failed');
            }

            setMessage('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', file);

            console.log('Uploading to:', `${API_URL}/api/upload`);
            console.log('File:', file.name, file.size, file.type);

            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Upload failed:', errorData);
                throw new Error(errorData.error || `Upload failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Upload success:', data);
            const imageUrl = data.imageUrl;

            // Update profile with new picture
            const updateResponse = await fetch(`${API_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || '',
                },
                body: JSON.stringify({ profilePicture: imageUrl }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || 'Failed to update profile picture');
            }

            setProfile({ ...profile, profilePicture: imageUrl });
            await refreshUser();
            setMessage('Profile picture updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            console.error('Full upload error:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // ============================================================================
    // Render
    // ============================================================================
    return (
        <Layout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground">
                        Manage your account settings.
                    </p>
                </div>

                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <Input
                                label="Username"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                placeholder="username"
                                required
                            />
                            <Input
                                label="Name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Your name"
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                required
                            />
                            <Button type="submit">Save Changes</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {profile.profilePicture && (
                                <div className="flex justify-center">
                                    <img
                                        src={profile.profilePicture}
                                        alt="Profile"
                                        className="h-32 w-32 rounded-full object-cover border-4 border-primary"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col items-center gap-4">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                        }}
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="pointer-events-none"
                                            isLoading={uploading}
                                        >
                                            {uploading ? 'Uploading...' : 'Choose New Picture'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            JPG, PNG or GIF. Max 5MB.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                }
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                                }
                                required
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                }
                                required
                            />
                            <Button type="submit">Change Password</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
