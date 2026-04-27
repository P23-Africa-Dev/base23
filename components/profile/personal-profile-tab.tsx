import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { Camera, Upload, Edit3, X, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { optimizeImageToMaxSize } from '@/utils/imageOptimizer';
import { useRef, useState } from 'react';

interface User {
    id: number;
    name: string;
    phone?: string;
    country?: string;
    linkedin?: string;
    position?: string;
    profile_picture?: string | null;
    [key: string]: any; // Allow additional properties
}

interface PersonalProfileTabProps {
    user: User;
}

type PersonalProfileForm = {
    name: string;
    phone: string;
    country: string;
    linkedin: string;
    position: string;
    profile_picture?: File | null;
};

export default function PersonalProfileTab({ user }: PersonalProfileTabProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [data, setDataState] = useState<PersonalProfileForm>({
        name: user.name || '',
        phone: user.phone || '',
        country: user.country || '',
        linkedin: user.linkedin || '',
        position: user.position || '',
        profile_picture: null,
    });
    const setData = (field: keyof PersonalProfileForm | PersonalProfileForm, value?: any) => {
        if (typeof field === 'object') { setDataState(field); return; }
        setDataState((prev) => ({ ...prev, [field]: value }));
    };
    const [errors, setErrors] = useState<Partial<Record<keyof PersonalProfileForm, string>>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('country', data.country);
        formData.append('linkedin', data.linkedin);
        formData.append('position', data.position);
        if (data.profile_picture) formData.append('profile_picture', data.profile_picture);

        try {
            await axios.post('/profile/personal/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setData('profile_picture', null);
            setRecentlySuccessful(true);
            setTimeout(() => setRecentlySuccessful(false), 2000);
            setIsEditMode(false);
        } catch (err: any) {
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const cancelEdit = () => {
        // Reset form data to original user data
        setData({
            name: user.name || '',
            phone: user.phone || '',
            country: user.country || '',
            linkedin: user.linkedin || '',
            position: user.position || '',
            profile_picture: null,
        });
        setPreviewUrl(user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`);
        setIsEditMode(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setData('profile_picture', null);
            setPreviewUrl(user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`);
            return;
        }
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            e.target.value = '';
            setData('profile_picture', null);
            setPreviewUrl(user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`);
            return;
        }
        // Validate file size and optimize if needed (max 2MB for profile update)
        let optimized = file;
        let progressToastId: string | undefined;
        if (file.size > 2 * 1024 * 1024) {
            toast.dismiss();
            progressToastId = toast.loading('Optimizing large image... This may take a few seconds.', { duration: 30000 });
            try {
                optimized = await optimizeImageToMaxSize(file, 2);
                toast.dismiss();
                if (optimized.size < 2 * 1024 * 1024) {
                    toast.success('Image optimized successfully!');
                } else {
                    toast.error('Image is still too large after optimization. Please upload a smaller image (max 2MB).');
                    e.target.value = '';
                    setData('profile_picture', null);
                    setPreviewUrl(user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`);
                    return;
                }
            } catch (error) {
                toast.dismiss();
                toast.error('Failed to optimize image. Please try a smaller file.');
                e.target.value = '';
                setData('profile_picture', null);
                setPreviewUrl(user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=ffffff&size=200`);
                return;
            }
        }
        setData('profile_picture', optimized);
        setPreviewUrl(URL.createObjectURL(optimized));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="mx-auto max-w-4xl py-6 pb-20">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="mb-1 text-lg font-semibold text-gray-900">Personal Information</h2>
                            <p className="text-sm text-gray-600">
                                {isEditMode ? 'Update your personal details and profile information.' : 'View your personal details and profile information.'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!isEditMode ? (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditMode(true)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Edit Profile</span>
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={cancelEdit}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Profile Picture Section */}
                        {isEditMode && (
                            <div className="flex flex-col items-center space-y-4 rounded-lg bg-gray-50 p-8">
                                <div className="relative">
                                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                                        <img
                                            src={
                                                previewUrl ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6366f1&color=ffffff&size=200`
                                            }
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=6366f1&color=ffffff&size=200`;
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="absolute -right-1 -bottom-1 rounded-full bg-blue-600 p-2 text-white shadow-lg transition-colors hover:bg-blue-700"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </button>
                                </div>

                                <Toaster
                                    position="top-right"
                                    toastOptions={{
                                        duration: 4000,
                                        style: { background: '#363636', color: '#fff', fontSize: '12px' },
                                        success: { duration: 4000, style: { background: '#031c5b', fontSize: '12px' } },
                                        error: { duration: 5000, style: { background: '#ef4444', fontSize: '12px' } },
                                    }}
                                />

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>Upload new picture</span>
                                    </button>
                                </div>

                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <InputError message={errors.profile_picture} />
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={isEditMode ? data.name : user.name || 'Not specified'}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required={isEditMode}
                                    readOnly={!isEditMode}
                                    placeholder="Enter your full name"
                                    className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                                {isEditMode && <InputError message={errors.name} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                                <Input id="email" type="email" value={user.email} disabled className="w-full bg-gray-100 text-gray-500" />
                                <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={isEditMode ? data.phone : user.phone || 'Not specified'}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    readOnly={!isEditMode}
                                    placeholder="Enter your phone number"
                                    className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                                {isEditMode && <InputError message={errors.phone} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                                <Input
                                    id="country"
                                    value={isEditMode ? data.country : user.country || 'Not specified'}
                                    onChange={(e) => setData('country', e.target.value)}
                                    readOnly={!isEditMode}
                                    placeholder="Enter your country"
                                    className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                                {isEditMode && <InputError message={errors.country} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position/Job Title</Label>
                                <Input
                                    id="position"
                                    value={isEditMode ? data.position : user.position || 'Not specified'}
                                    onChange={(e) => setData('position', e.target.value)}
                                    readOnly={!isEditMode}
                                    placeholder="Enter your position or job title"
                                    className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                                {isEditMode && <InputError message={errors.position} />}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">LinkedIn Profile</Label>
                                <Input
                                    id="linkedin"
                                    type="url"
                                    value={isEditMode ? data.linkedin : user.linkedin || 'Not specified'}
                                    onChange={(e) => setData('linkedin', e.target.value)}
                                    readOnly={!isEditMode}
                                    placeholder="https://linkedin.com/in/your-profile"
                                    className={`w-full ${!isEditMode ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                                {isEditMode && <InputError message={errors.linkedin} />}
                            </div>
                        </div>

                        {/* Submit Button - Only show in edit mode */}
                        {isEditMode && (
                            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium">Profile updated successfully!</span>
                                    </div>
                                </Transition>

                                <div className="flex items-center space-x-3">
                                    <Button type="button" onClick={cancelEdit} variant="outline" disabled={processing} className="px-6 py-2">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center space-x-2 bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                                    >
                                        <Check className="h-4 w-4" />
                                        <span>{processing ? 'Saving...' : 'Save Changes'}</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
