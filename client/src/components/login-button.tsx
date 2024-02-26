import { useAuth0 } from "@auth0/auth0-react";

import { Button } from "./ui/button";

const LoginButton: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return null;
  }

  const handleLoginWithRedirection = () => {
    loginWithRedirect();
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
