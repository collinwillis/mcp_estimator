import {ThemeProvider} from "@mui/material";
import {MemoryRouter as Router, Route, Routes} from "react-router-dom";
import AuthRoute from "./components/auth_route";
import EstimatorDrawer from "./components/drawer";
import {estimatorTheme} from "./config/theme";
import AuthScreen from "./features/auth/presentation/auth_screen";
import ProposalSelectScreen from "./features/home/proposal_select";
import PhaseHomeScreen from "./features/phase home/phase_home";
import ProposalHomeScreen from "./features/proposal home/proposal_home";
import WbsHomeScreen from "./features/wbs home/wbs_home";
import {auth} from "./setup/config/firebase";
import EmailVerificationScreen from "./features/auth/presentation/verify_email";
import {useEffect, useState} from "react";
import {getAuth, onAuthStateChanged, User} from "firebase/auth";
import AdminDashboard from "./features/admin/admin_dashboard";

const onSignOut = () => {
    auth.signOut();
};

export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ThemeProvider theme={estimatorTheme}>
            <Router>
                <Routes>
                    <Route path={"/login"} element={<AuthScreen/>}/>
                    <Route path={"/verify-email"} element={<EmailVerificationScreen user={currentUser}/>}/>
                    <Route
                        path="/"
                        element={
                            <AuthRoute>
                                <EstimatorDrawer>
                                    <ProposalSelectScreen/>
                                </EstimatorDrawer>
                            </AuthRoute>
                        }
                    />
                    <Route
                        path={"/proposal/:proposalId"}
                        element={
                            <AuthRoute>
                                <EstimatorDrawer>
                                    <ProposalHomeScreen/>
                                </EstimatorDrawer>
                            </AuthRoute>
                        }
                    />
                    <Route
                        path={"/proposal/:proposalId/wbs/:wbsId"}
                        element={
                            <AuthRoute>
                                <EstimatorDrawer>
                                    <WbsHomeScreen/>
                                </EstimatorDrawer>
                            </AuthRoute>
                        }
                    />
                    <Route
                        path={"/proposal/:proposalId/wbs/:wbsId/phase/:phaseId"}
                        element={
                            <AuthRoute>
                                <EstimatorDrawer>
                                    <PhaseHomeScreen/>
                                </EstimatorDrawer>
                            </AuthRoute>
                        }
                    />
                    <Route
                        path={"/admin"}
                        element={
                            <AuthRoute>
                                <AdminDashboard/>
                            </AuthRoute>
                        }
                    />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}
