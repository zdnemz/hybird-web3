"use client";

import React, { ComponentType, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export interface WithAuthProps {
  auth: ReturnType<typeof useAuth>;
}

type OmitAuthProps<T> = Omit<T, keyof WithAuthProps>;

export interface WithAuthOptions {
  requireAuth?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P & WithAuthProps>,
  options: WithAuthOptions = {},
): ComponentType<OmitAuthProps<P>> {
  const {
    requireAuth = true,
    loadingComponent = <Loading />,
    redirectTo = "/connect",
  } = options;

  const ComponentWithAuth = (props: OmitAuthProps<P>) => {
    const auth = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
      if (hasRedirected.current) return;

      if (auth.isLoading) return;

      if (requireAuth && !auth.isAuthenticated) {
        hasRedirected.current = true;
        router.push(redirectTo);
        return;
      }

      if (!requireAuth && auth.isAuthenticated) {
        hasRedirected.current = true;
        router.push(redirectTo);
      }
    }, [auth, router]);

    if (auth.isLoading) {
      return loadingComponent;
    }

    if (
      (requireAuth && !auth.isAuthenticated) ||
      (!requireAuth && auth.isAuthenticated)
    ) {
      return null;
    }

    return <WrappedComponent {...(props as P)} auth={auth} />;
  };

  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  ComponentWithAuth.displayName = `withAuth(${displayName})`;

  return ComponentWithAuth;
}
