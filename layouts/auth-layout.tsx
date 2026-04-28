import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    LeftDesktopContent,
    mobileTopContent,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    LeftDesktopContent?: React.ReactNode;
    mobileTopContent?: React.ReactNode;
    title?: string;
    description?: string;
}) {
    return (
        <AuthLayoutTemplate mobileTopContent={mobileTopContent} LeftDesktopContent={LeftDesktopContent}  {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
