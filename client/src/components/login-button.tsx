import { useAuth0 } from "@auth0/auth0-react";

import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/types/storage";

import { Button } from "./ui/button";

const LoginButton: React.FC = () => {
  const { user, loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return null;
  }

  const handleLoginWithRedirection = () => {
    loginWithRedirect();
    localStorage.setItem(LOCAL_STORAGE_KEYS.sidebar, "true");
  };

  return (
    <div className="center-button">
      <Button
        variant="outline"
        className="btn btn-primary"
        onClick={handleLoginWithRedirection}
      >
        Log In
      </Button>
    </div>
  );
};

export default LoginButton;
