import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";

export default function AuthLayout({
  children,
  LeftDesktopContent,
  mobileTopContent,
  title,
  subtitle,
  ...props
}: {
  children: React.ReactNode;
  LeftDesktopContent?: React.ReactNode;
  mobileTopContent?: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <AuthLayoutTemplate
      mobileTopContent={mobileTopContent}
      LeftDesktopContent={LeftDesktopContent}
      title={title}
      subtitle={subtitle}
      {...props}
    >
      {children}
    </AuthLayoutTemplate>
  );
}
