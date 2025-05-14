import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import ManagerDashboard from "@/pages/manager/Dashboard";
import ManagerSessions from "@/pages/manager/Sessions";
import ManagerGoals from "@/pages/manager/Goals";
import ManagerPayments from "@/pages/manager/Payments";
import CoachDashboard from "@/pages/coach/Dashboard";
import CoachSessions from "@/pages/coach/Sessions";
import CoachGoals from "@/pages/coach/Goals";
import EntrepreneurDashboard from "@/pages/entrepreneur/Dashboard";
import EntrepreneurSessions from "@/pages/entrepreneur/Sessions";
import EntrepreneurGoals from "@/pages/entrepreneur/Goals";
import ManagerLayout from "@/layouts/ManagerLayout";
import CoachLayout from "@/layouts/CoachLayout";
import EntrepreneurLayout from "@/layouts/EntrepreneurLayout";
import Home from "./pages/Home";
import { Toaster } from "./components/Toaster";
import Users from "@/pages/manager/Users";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Manager Layout */}
        <Route element={<ManagerLayout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/sessions" element={<ManagerSessions />} />
          <Route path="/manager/goals" element={<ManagerGoals />} />
          <Route path="/manager/payments" element={<ManagerPayments />} />
          <Route path="/manager/users" element={<Users />} />
        </Route>

        {/* Coach Layout */}
        <Route element={<CoachLayout />}>
          <Route path="/coach/dashboard" element={<CoachDashboard />} />
          <Route path="/coach/sessions" element={<CoachSessions />} />
          <Route path="/coach/goals" element={<CoachGoals />} />
        </Route>

        {/* Entrepreneur Layout */}
        <Route element={<EntrepreneurLayout />}>
          <Route
            path="/entrepreneur/dashboard"
            element={<EntrepreneurDashboard />}
          />
          <Route path="/entrepreneur/sessions" element={<EntrepreneurSessions />} />
          <Route path="/entrepreneur/goals" element={<EntrepreneurGoals />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
