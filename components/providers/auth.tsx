"use client";

import { AuthContext } from "@/contexts/auth-context";
import { fetcher } from "@/lib/app/fetcher";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SiweMessage } from "siwe";
import {
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useSignMessage,
} from "wagmi";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const { mutateAsync: connect } = useConnect();
  const { mutateAsync: disconnect } = useDisconnect();
  const { isConnecting } = useConnection();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const connectors = useConnectors();

  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsCheckingSession(true);
      const { data } = await fetcher<{ address: string; chainId: number }>({
        url: "/api/auth/session",
        method: "get",
        config: { withCredentials: true },
      });
      if (!data) throw new Error();

      setIsAuthenticated(true);
      setUser(data.address);
    } catch (error) {
      console.error("Session check failed:", error);

      setUser(null);
      disconnect();
    } finally {
      setIsCheckingSession(false);
    }
  };

  const login = useCallback(
    async (connectorId: string) => {
      if (isAuthenticated) {
        router.push("/dashboard");
        return;
      }
      setIsLoading(true);
      try {
        const connector = connectors.find((c) => c.id === connectorId);

        if (!connector) {
          throw new Error(`Connector ${connectorId} not found`);
        }

        const address = (await connect({ connector })).accounts[0];

        const { data: dataNonce } = await fetcher<{
          nonce: string;
        }>({
          url: "/api/auth/nonce",
          method: "get",
        });
        if (!dataNonce) return;

        const message = new SiweMessage({
          domain: window.location.host,
          address: address,
          statement: "Sign in with Ethereum to the app.",
          uri: window.location.origin,
          version: "1",
          chainId: 1,
          nonce: dataNonce.nonce,
        });

        const signature = await signMessageAsync({
          message: message.prepareMessage(),
        });

        const { data: dataVerify } = await fetcher<{
          address: string;
          isRegistered: boolean;
        }>({
          url: "/api/auth/verify",
          method: "post",
          data: { message: message.toMessage(), signature },
        });
        if (!dataVerify) return;

        setIsAuthenticated(true);
        setUser(dataVerify.address);

        if (dataVerify.isRegistered) {
          router.push("/dashboard");
          toast.success("Login successfully");
        } else {
          router.push("/profile/set");
          toast.success("Login successfully");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.message);
          return;
        }

        toast.error("Something went wrong");
        console.error("Sign in failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [connect, connectors, isAuthenticated, router, signMessageAsync],
  );

  const logout = async () => {
    await fetcher({
      url: "/api/auth/logout",
      method: "delete",
      config: { withCredentials: true },
    });

    setUser(null);
    setIsAuthenticated(false);

    disconnect();

    toast.success("Logout successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isConnecting || isLoading || isCheckingSession,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
