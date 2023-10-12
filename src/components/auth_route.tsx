import {getAuth, onAuthStateChanged} from "firebase/auth";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

interface AuthRouteProps {
    children: React.ReactNode;
}

function AuthRoute(props: AuthRouteProps) {
    const {children} = props;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                if (user.emailVerified) {
                    setLoading(false);
                } else {
                    console.log("Email not verified");
                    navigate("/verify-email"); // Adjust the route as per your app's structure
                }
            } else {
                console.log("unauthorized");
                navigate("/login");
            }
        });

        // Cleanup the subscription on unmount
        return () => unsubscribe();
    }, [navigate]); // No need to include 'auth' as a dependency

    if (loading) return <p>loading ....</p>;
    return <>{children}</>;
}

export default AuthRoute;
