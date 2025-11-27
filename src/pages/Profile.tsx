import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user } = useAuth();
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
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

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || '',
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) throw new Error('Update failed');

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
            const response = await fetch('http://localhost:3000/api/users/me/password', {
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

            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const imageUrl = data.imageUrl;

            // Update profile with new picture
            const updateResponse = await fetch('http://localhost:3000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'user-id': user?.id || '',
                },
                body: JSON.stringify({ ...profile, profilePicture: imageUrl }),
            });

            if (!updateResponse.ok) throw new Error('Failed to update profile picture');

            setProfile({ ...profile, profilePicture: imageUrl });
            setMessage('Profile picture updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

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
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Upload New Picture
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                    disabled={uploading}
                                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                                />
                                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
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
