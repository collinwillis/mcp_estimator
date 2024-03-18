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
import {md5} from '@mui/x-license-pro/encoding/md5';
import {LicenseInfo} from '@mui/x-license-pro';
import {LICENSE_SCOPES} from '@mui/x-license-pro/utils/licenseScope';
import {LICENSING_MODELS} from '@mui/x-license-pro/utils/licensingModel'

const onSignOut = () => {
    auth.signOut();
};

export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        let orderNumber = '';
        let expiryTimestamp = Date.now();
        let scope = LICENSE_SCOPES[0]; // 'pro' or 'premium'
        let licensingModel = LICENSING_MODELS[0]; // 'perpetual', 'subscription'
        let licenseInfo = `O=${orderNumber},E=${expiryTimestamp},S=${scope},LM=${licensingModel},KV=2`;
        LicenseInfo.setLicenseKey(md5(btoa(licenseInfo)) + btoa(licenseInfo));
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
