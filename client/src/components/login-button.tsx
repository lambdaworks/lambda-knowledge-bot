import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "./ui/button";
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/types/storage";

interface LoginButtonProps {
  setEmail: (value: string | null) => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ setEmail }) => {
  const { user, loginWithRedirect, isAuthenticated } = useAuth0();
  if (user?.email) {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.email, user?.email)
    setEmail(user.email)
  }
  if (!isAuthenticated) {
    return (
      <div className="center-button">
        <Button variant="outline" className="btn btn-primary loginBtn"
          onClick={() => {
            loginWithRedirect();
            localStorage.setItem(LOCAL_STORAGE_KEYS.sidebar, "true")
          }}>Log In</Button>
      </div>
    );
  }
};

export default LoginButton;
