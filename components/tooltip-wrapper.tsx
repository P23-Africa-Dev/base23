function TooltipWrapper({
    label,
    enabled,
    children,
}: {
    label: string;
    enabled: boolean;
    children: React.ReactNode;
}) {
    if (!enabled) return <>{children}</>;

    return (
        <div className="group relative">
            {children}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[9px] text-white opacity-0 transition group-hover:opacity-100">
                {label}
            </div>
        </div>
    );
}
