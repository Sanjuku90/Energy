import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Plans from "@/pages/Plans";
import Wallet from "@/pages/Wallet";
import AdminPanel from "@/pages/AdminPanel";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      {/* Public Route */}
      <Route path="/" component={Home} />

      {/* Protected Routes (Layout handles auth check visual, page handles redirect logic if needed) */}
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/plans">
        <Layout><Plans /></Layout>
      </Route>
      <Route path="/wallet">
        <Layout><Wallet /></Layout>
      </Route>
      <Route path="/admin">
        <Layout><AdminPanel /></Layout>
      </Route>
      <Route path="/profile">
        <Layout><Profile /></Layout>
      </Route>
      <Route path="/settings">
        <Layout><Settings /></Layout>
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
