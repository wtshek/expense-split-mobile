import { Redirect } from "expo-router";

export default function Index() {
  // AuthWrapper will handle authentication state
  // If user is not authenticated, AuthWrapper will show auth forms
  // If user is authenticated, this will redirect to the main app
  return <Redirect href="/(tabs)" />;
}
