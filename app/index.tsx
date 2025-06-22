import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Check if user is already authenticated
    // For now, always redirect to login
    router.replace("/login");
  }, []);

  return null;
}
