import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LiveQueue } from './components/LiveQueue';
import { InventoryView } from './components/InventoryView';
import { SalesDashboard } from './components/SalesDashboard';
import { AdminSimulatorDrawer } from './components/AdminSimulatorDrawer';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ToastLayer } from './components/ToastLayer';
import { TrainBoard } from './components/TrainBoard';
import { AIVoiceAssistantModal } from './components/AIVoiceAssistantModal';
import { IncomingOrderModal } from './components/IncomingOrderModal';

const MainLayout: React.FC = () => {
  const { 
    activeTab, trains, incomingOrder, setIncomingOrder, 
    startPackingOrder, setSelectedOrder, isAIAssistantOpen, setIsAIAssistantOpen 
  } = useApp();

  const handleAcceptIncoming = () => {
    if (incomingOrder) {
      startPackingOrder(incomingOrder.id);
      setSelectedOrder(incomingOrder);
      setIncomingOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto w-full relative">
        {/* Fixed Header */}
        <Header />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto pb-nav px-3.5 pt-3">
          <div className="fade-in">
            {activeTab === 'queue'     && <LiveQueue />}
            {activeTab === 'trains'    && <TrainBoard />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'sales'     && <SalesDashboard />}
            {activeTab === 'admin'     && <AdminSimulatorDrawer />}
          </div>
        </main>

        {/* Bottom Floating Navigation with Center AI Orb */}
        <BottomNav />
      </div>

      {/* Global Notifications & Modals */}
      <ToastLayer />
      <OrderDetailModal />

      {/* Incoming Order Pop-up Alert Sheet */}
      <IncomingOrderModal
        order={incomingOrder}
        train={incomingOrder ? trains[incomingOrder.trainId] || null : null}
        onAccept={handleAcceptIncoming}
        onDismiss={() => setIncomingOrder(null)}
      />

      {/* NVIDIA AI Voice Assistant Dialog */}
      <AIVoiceAssistantModal 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
