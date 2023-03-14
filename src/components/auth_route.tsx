import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../setup/config/firebase";

interface AuthRouteProps {
  children: React.ReactNode;
}
function AuthRoute(props: AuthRouteProps) {
  const { children } = props;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const AuthCheck = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        console.log("unauthorized");
        navigate("/login");
      }
    });
    return () => AuthCheck();
  }, [auth]);

  if (loading) return <p>loading ....</p>;
  return <>{children}</>;
}

export default AuthRoute;
