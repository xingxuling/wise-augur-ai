import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuickNav } from "@/components/QuickNav";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Bazi from "./pages/Bazi";
import Fengshui from "./pages/Fengshui";
import Checkout from "./pages/Checkout";
import Share from "./pages/Share";
import Learning from "./pages/Learning";
import LessonDetail from "./pages/LessonDetail";
import Referral from "./pages/Referral";
import Membership from "./pages/Membership";
import Pricing from "./pages/Pricing";
import Chat from "./pages/Chat";
import SubscriptionManage from "./pages/SubscriptionManage";
import AdminFeatures from "./pages/AdminFeatures";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <QuickNav />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/bazi" element={<Bazi />} />
          <Route path="/fengshui" element={<Fengshui />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/share/:shareCode" element={<Share />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/learning/lesson/:lessonId" element={<LessonDetail />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/subscription" element={<SubscriptionManage />} />
          <Route path="/admin/features" element={<AdminFeatures />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
