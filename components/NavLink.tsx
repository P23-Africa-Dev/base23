"use client";

/**
 * NavLink — a drop-in replacement for next/link that defers RSC prefetch
 * until the user signals intent (hover / touch-start).
 *
 * Why:
 *   Next.js <Link> auto-prefetches every link that enters the viewport,
 *   which causes _rsc network requests for every sidebar route at load time.
 *   This component blocks that viewport-triggered prefetch and only fires it
 *   on hover, matching the pattern in:
 *   node_modules/next/dist/docs/01-app/02-guides/prefetching.md
 *
 * API:
 *   Identical to next/link — pass any <Link> prop; children are forwarded.
 */

import Link, { type LinkProps } from "next/link";
import React, { useCallback, useRef, useState } from "react";

type NavLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
  /** aria-current value forwarded to the underlying <a> */
  "aria-current"?: React.AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  style?: React.CSSProperties;
};

/**
 * Renders a next/link with prefetch disabled until hover/touch-start.
 * Once the user shows intent, prefetch={null} restores the default
 * (static = full, dynamic = loading-boundary) behaviour — so navigation
 * still feels instant after the first hover.
 */
const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ children, ...props }, ref) {
    const [shouldPrefetch, setShouldPrefetch] = useState<null | false>(false);

    const activate = useCallback(() => {
      if (shouldPrefetch === false) setShouldPrefetch(null); // null = auto/default
    }, [shouldPrefetch]);

    // Deduplicate rapid pointer events with a ref flag.
    const activated = useRef(false);
    const onIntent = useCallback(() => {
      if (activated.current) return;
      activated.current = true;
      activate();
    }, [activate]);

    return (
      <Link
        {...props}
        ref={ref}
        prefetch={shouldPrefetch}
        onMouseEnter={onIntent}
        onTouchStart={onIntent}
        onFocus={onIntent}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export default NavLink;
