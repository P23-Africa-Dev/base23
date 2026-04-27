import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import Link from 'next/link';
import axios from 'axios';
import { LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { LogoutConfirmationModal } from './ui/logout-confirmation-modal';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        cleanup();
        axios.post('/logout').then(() => {
            window.location.href = '/login';
        });
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/settings/profile" onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button className="block w-full" onClick={handleLogoutClick}>
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>

            <LogoutConfirmationModal isOpen={showLogoutModal} onConfirm={handleLogoutConfirm} onCancel={handleLogoutCancel} />
        </>
    );
}
