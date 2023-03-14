import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material";
import { Route, MemoryRouter as Router, Routes } from "react-router-dom";
import AuthRoute from "./components/auth_route";
import EstimatorDrawer from "./components/drawer";
import { estimatorTheme } from "./config/theme";
import AuthScreen from "./features/auth/presentation/auth_screen";
import ProposalSelectScreen from "./features/home/proposal_select";
import PhaseHomeScreen from "./features/phase home/phase_home";
import ProposalHomeScreen from "./features/proposal home/proposal_home";
import WbsHomeScreen from "./features/wbs home/wbs_home";
import { useUserPreferences } from "./hooks/user_preferences_hook";
import { auth } from "./setup/config/firebase";

const onSignOut = () => {
  auth.signOut();
};

export default function App() {
  return (
    <ThemeProvider theme={estimatorTheme}>
      <Router>
        <Routes>
          <Route path={"/login"} element={<AuthScreen />} />
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
            path={"/proposal/:proposalId"}
            element={
              <AuthRoute>
                <EstimatorDrawer>
                  <ProposalHomeScreen />
                </EstimatorDrawer>
              </AuthRoute>
            }
          />
          <Route
            path={"/proposal/:proposalId/wbs/:wbsId"}
            element={
              <AuthRoute>
                <EstimatorDrawer>
                  <WbsHomeScreen />
                </EstimatorDrawer>
              </AuthRoute>
            }
          />
            <Route
                path={"/proposal/:proposalId/wbs/:wbsId/phase/:phaseId"}
                element={
              <AuthRoute>
                  <EstimatorDrawer>
                      <PhaseHomeScreen />
                  </EstimatorDrawer>
              </AuthRoute>
            }
            />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
