import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { ProtectedLayout } from "./layouts/ProtectedLayout";
import TodosPage from "./pages/TodosPage";
import HabitsPage from "./pages/HabitsPage";
import VerificationPage from "./pages/VerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/Dashboard";
import PetDetailsPage from "./pages/PetDetailsPage";
import SettingsPage from "./pages/SettingsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/verification-email' element={<VerificationPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/todos' element={<TodosPage />} />
          <Route path='/habits' element={<HabitsPage />} />
          <Route path='/pet' element={<PetDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;