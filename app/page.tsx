import HomeClient from "./components/HomeClient";

export default function Home() {
  // Always show the homepage - let the client decide what to do
  // The navbar will show login/signup for unauthenticated users
  // and authenticated users can navigate to dashboard from there
  return <HomeClient />;
}
