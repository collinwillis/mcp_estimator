import { useEffect, useState } from 'react';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

import { ThemeProvider } from '@mui/material';
import { LicenseInfo } from '@mui/x-license-pro';
import { md5 } from '@mui/x-license-pro/encoding/md5';
import { LICENSE_SCOPES } from '@mui/x-license-pro/utils/licenseScope';
import { LICENSING_MODELS } from '@mui/x-license-pro/utils/licensingModel';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthRoute from './components/auth_route';
import EstimatorDrawer from './components/drawer';
import { estimatorTheme } from './config/theme';
import AdminDashboard from './features/admin/admin_dashboard';
import AuthScreen from './features/auth/presentation/auth_screen';
import EmailVerificationScreen from './features/auth/presentation/verify_email';
import ProposalSelectScreen from './features/home/proposal_select';
import PhaseHomeScreen from './features/phase home/phase_home';
import ProposalHomeScreen from './features/proposal home/proposal_home';
import WbsHomeScreen from './features/wbs home/wbs_home';
import { auth } from './setup/config/firebase';

const onSignOut = () => {
  auth.signOut();
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const orderNumber = '';
    const expiryTimestamp = Date.now();
    const scope = LICENSE_SCOPES[0]; // 'pro' or 'premium'
    const licensingModel = LICENSING_MODELS[0]; // 'perpetual', 'subscription'
    const licenseInfo = `O=${orderNumber},E=${expiryTimestamp},S=${scope},LM=${licensingModel},KV=2`;
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
          <Route path="/login" element={<AuthScreen />} />
          <Route
            path="/verify-email"
            element={<EmailVerificationScreen user={currentUser} />}
          />
          <Route
            path="/"
            element={
              <AuthRoute>
                <EstimatorDrawer>
                  <ProposalSelectScreen />
                </EstimatorDrawer>
              </AuthRoute>
            }
          />
          <Route
            path="/proposal/:proposalId"
            element={
              <AuthRoute>
                <EstimatorDrawer>
                  <ProposalHomeScreen />
                </EstimatorDrawer>
              </AuthRoute>
            }
          />
          <Route
            path="/proposal/:proposalId/wbs/:wbsId"
            element={
              <AuthRoute>
                <EstimatorDrawer>
                  <WbsHomeScreen />
                </EstimatorDrawer>
              </AuthRoute>
            }
          />
          <Route
            path="/proposal/:proposalId/wbs/:wbsId/phase/:phaseId"
            element={
              <AuthRoute>
                <EstimatorDrawer>
                  <PhaseHomeScreen />
                </EstimatorDrawer>
              </AuthRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthRoute>
                <AdminDashboard />
              </AuthRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
