import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import { AppTab } from './types';
import Sidebar from './components/Sidebar';
import OrdersList from './components/OrdersList';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import Header from './components/Header';
import PrintableArea from './components/PrintableArea';
import SetupView from './components/SetupView';
import { usePrintJobs } from './hooks/usePrintJobs';
import { getOrCreateDeviceId } from './services/deviceService';
import {
  loadSettings,
  saveSettings,
  PersistedSettings,
  ApiSettings,
} from './services/settingsService';
import { getRestApiClient } from './services/restApiClient';
import { loadAuthSession } from './services/authService';

const App: React.FC = () => {
  const [deviceId] = useState(() => getOrCreateDeviceId());
  const [tenantProfile, setTenantProfile] = useState<any>(() => {
    const savedSession = loadAuthSession();
    return savedSession?.tenantProfile || null;
  });

  const [settings, setSettings] = useState<PersistedSettings>(() => {
    // Tentar carregar sessão salva primeiro
    const savedSession = loadAuthSession();
    if (savedSession) {
      const loadedSettings = loadSettings();
      return {
        ...loadedSettings,
        apiSettings: savedSession.apiSettings,
      };
    }
    return loadSettings();
  });
  const [flashScreen, setFlashScreen] = useState(false);

  const apiConfigured =
    !!settings.apiSettings?.baseUrl && !!settings.apiSettings?.accessToken;

  // Auto-save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync settings from Cloud
  useEffect(() => {
    const syncSettings = async () => {
      if (apiConfigured) {
        try {
          const apiClient = getRestApiClient();
          const profile = await apiClient.fetchProfile();

          if (profile && profile.settings) {
            setSettings(prev => {
              // Only update if changed to avoid loops/resets
              const newSettings = { ...prev };
              let changed = false;

              // Sync Paper Width
              const cloudWidth = profile.settings.printer_paper_width === 80 ? '80mm' : '58mm';
              if (prev.printerSettings.paperWidth !== cloudWidth) {
                newSettings.printerSettings.paperWidth = cloudWidth;
                changed = true;
              }

              // Sync Copies
              const cloudCopies = profile.settings.print_copies || 1;
              if (prev.printerSettings.copiesDelivery !== cloudCopies) {
                newSettings.printerSettings.copiesDelivery = cloudCopies;
                newSettings.printerSettings.copiesKitchen = cloudCopies;
                changed = true;
              }

              // Sync Auto Print
              const cloudAutoPrint = !!profile.settings.auto_print_on_confirm;
              if (prev.printerSettings.autoPrint !== cloudAutoPrint) {
                newSettings.printerSettings.autoPrint = cloudAutoPrint;
                changed = true;
              }

              return changed ? newSettings : prev;
            });
          }
        } catch (error) {
          console.error("Failed to sync settings:", error);
        }
      }
    };

    syncSettings();
  }, [apiConfigured]); // Run once when API becomes configured

  // Sync settings from Cloud
  useEffect(() => {
    const syncSettings = async () => {
      if (apiConfigured) {
        try {
          const apiClient = getRestApiClient();
          const profile = await apiClient.fetchProfile();

          if (profile && profile.settings) {
            setSettings(prev => {
              const newSettings = { ...prev };
              let changed = false;

              // Sync Paper Width
              const cloudWidth = profile.settings.printer_paper_width === 80 ? '80mm' : '58mm';
              if (prev.printerSettings.paperWidth !== cloudWidth) {
                newSettings.printerSettings.paperWidth = cloudWidth;
                changed = true;
              }

              // Sync Copies
              const cloudCopies = profile.settings.print_copies || 1;
              if (prev.printerSettings.copiesDelivery !== cloudCopies) {
                newSettings.printerSettings.copiesDelivery = cloudCopies;
                newSettings.printerSettings.copiesKitchen = cloudCopies;
                changed = true;
              }

              // Sync Auto Print
              const cloudAutoPrint = !!profile.settings.auto_print_on_confirm;
              if (prev.printerSettings.autoPrint !== cloudAutoPrint) {
                newSettings.printerSettings.autoPrint = cloudAutoPrint;
                changed = true;
              }

              return changed ? newSettings : prev;
            });
          }
        } catch (error) {
          console.error("Failed to sync settings:", error);
        }
      }
    };

    syncSettings();
  }, [apiConfigured]); // Run once when API becomes configured

  // Initialize API client when settings change
  useEffect(() => {
    if (settings.apiSettings) {
      const apiClient = getRestApiClient();
      try {
        apiClient.configure(settings.apiSettings);
      } catch (error) {
        console.error('Failed to configure API client:', error);
      }
    }
  }, [settings.apiSettings]);

  // Função de impressão
  const handlePrint = useCallback(async (htmlContent: string): Promise<void> => {
    // Alerta visual
    if (settings.printerSettings.visualAlert) {
      setFlashScreen(true);
      setTimeout(() => setFlashScreen(false), 1000);
    }

    // Alerta sonoro
    if (settings.printerSettings.alertSound) {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwPUKXh8LZiHQU5kdTzzn0pBSV5x/DabkMJE1+z5/CoWRMJRp/g8r1sIQUsgc7y2Yk2CBtpvO/mnE4ND1Cn4PO1YhwGOJHV8tB8KAUledHw2XBECRNgtOXxp1kUCUaf4PK8ayEFLIHO8tmJNggcabzv5pxODA9Qp+HztWIcBjiR1fPQfSgFJXnR8NlwRAkTYLTl8adZFAlGn+DyvGwhBSuBzvLZiTYIHGm87+acTgwPUKfh87ViHAY4kdXz0H0oBSV60fDZb0QJFGCz5/KnWRQJRp/g8rxsIQUrgc7y2Yk2CBxpvO/jnE4ND1Cn4fO1YhwGOJHV89B9KAUletHw2W9ECRRgs+fyp1kUCUaf4PK8bCEFK4HO8tmJNggcabzv45xODA9Qp+HztWIcBjiR1fPQfSgFJXrR8NlvRAkUYLTl4qdZEwlGn+DyvGwhBSuBzvLZiTYIHGm87+OcTgwPUKfh87ViHAY4kdXz0H0oBSV60fDZb0QJFGC05+KnWRMJRp/g8rxsIQUrgc7y2Yk2CBxpu+/jnE4ND1Cn4fO1YhwGOJHV89B9KAUletHw2W9ECRRgtOXip1kTCUaf4PK8bCEFK4HO8tmJNggcabzv45xODA9Qp+HztWIcBjiR1fPQfSgFJXrR8NlvRAkUYLTl4qdZEwlGn+DyvGwhBSuBzvLZiTYIHGm87+OcTgwPUKfh87ViHAY4kdXz0H0oBSV60fDZb0QJFGC05eKnWRMJRp/g8rxsIQUrgc7y2Yk2CBxpvO/jnE4ND1Cn4fO1YhwGOJHV89B9KAUletHw2W9ECRRgtOXip1kTCUaf4PK8bCEFK4HO8tmJNggcabzv45xODA9Qp+HztWIcBjiR1fPQfSgFJXrR8NlvRAkUYLTl4qdZEwlGn+DyvGwhBSuBzvLZiTYIHGm87+OcTgwPUKfh87ViHAY4kdXz0H0oBSV60fDZb0QJFGC05eKnWRMJRp/g8rxsIQUrgc7y2Yk2CBxpvO/jnE4ND1Cn4fO1YhwGOJHV89B9KAUletHw2W9ECRRgtOXip1kTCUaf4PK8bCEFK4HO8tmJNggcabzv45xODA9Qp+HztWIcBjiR1fPQfSgFJXrR8NlvRAkUYLTl4qdZEwlGn+DyvGwhBSuBzvLZiTYIHGm87+OcTgwPUKfh87ViHAY4kdXz0H0oBSV60fDZb0QJFGC05eKnWRMJRp/g8rxsIQUrgc7y2Yk2CBxpvO/jnE4ND1Cn4fOw=='
      );
      audio.volume = 0.5;
      audio.play().catch(console.error);
    }

    // Check for Electron first
    if (window.electronAPI) {
      try {
        // Enforce paper width based on settings
        const width = settings.printerSettings.paperWidth;
        const { top, bottom, left, right } = settings.printerSettings.margins || { top: 0, bottom: 0, left: 0, right: 0 };

        const styleInjection = `<style>
          @page { 
            margin: ${top}mm ${right}mm ${bottom}mm ${left}mm; 
            size: ${width} auto; 
          } 
          body { 
            width: ${width}; 
            margin: 0; 
            padding: 0; 
          }
        </style>`;

        // Inject style before debug or body
        const finalContent = htmlContent.includes('</head>')
          ? htmlContent.replace('</head>', `${styleInjection}</head>`)
          : styleInjection + htmlContent;

        await window.electronAPI.print(finalContent, {
          silent: settings.printerSettings.silentPrinting,
          deviceName: settings.printerSettings.selectedPrinter,
        });
      } catch (error) {
        console.error('Electron print failed:', error);
      }
      return;
    }

    return new Promise((resolve) => {
      // Print via iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              @page {
                size: ${settings.printerSettings.paperWidth} auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: ${settings.printerSettings.paperWidth};
                margin: 0;
                padding: 5mm;
              }
            </style>
          </head>
          <body>${htmlContent}</body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        }, 500);
      } else {
        resolve();
      }
    });
  }, [settings.printerSettings]); // Dependencies for useCallback

  // Hook para gerenciar jobs de impressão
  const { pendingJobs, printedJobs, error, lastChecked, manualPrint, forceRefresh } =
    usePrintJobs({
      deviceId,
      autoPrint: settings.printerSettings.autoPrint,
      onPrint: handlePrint,
      apiConfigured,
    });

  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ORDERS);

  const getFilteredOrders = () => {
    let result = [...pendingJobs];
    if (settings.printerSettings.hidePrinted) {
      result = result.filter((o) => o.status !== 'printed');
    }
    if (settings.printerSettings.orderSorting === 'oldest') {
      result.reverse();
    }
    return result;
  };

  const handleLogout = () => {
    // 1. Clear current API settings to show SetupView
    setSettings((s) => ({ ...s, apiSettings: null }));

    // 2. Clear Auth Session from localStorage (Full Logout)
    const { clearAuthSession } = require('./services/authService');
    clearAuthSession();

    // 3. Reset Tenant Profile state
    setTenantProfile(null);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const apiClient = getRestApiClient();
      await apiClient.updateOrderStatus(orderId, status);
      forceRefresh();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.ORDERS:
        return (
          <OrdersList
            orders={getFilteredOrders()}
            onPrint={manualPrint}
            onUpdateStatus={handleStatusUpdate}
            autoPrint={settings.printerSettings.autoPrint}
          />
        );
      case AppTab.HISTORY:
        return <HistoryView history={printedJobs} onPrint={handlePrint} />;
      case AppTab.SETTINGS:
        return (
          <SettingsView
            printerSettings={settings.printerSettings}
            setPrinterSettings={(valueOrFn) => {
              setSettings((s) => ({
                ...s,
                printerSettings:
                  typeof valueOrFn === 'function'
                    ? (valueOrFn as any)(s.printerSettings)
                    : valueOrFn,
              }));
            }}
            couponConfig={settings.couponConfig}
            setCouponConfig={(valueOrFn) => {
              setSettings((s) => ({
                ...s,
                couponConfig:
                  typeof valueOrFn === 'function'
                    ? (valueOrFn as any)(s.couponConfig)
                    : valueOrFn,
              }));
            }}
            apiSettings={settings.apiSettings}
            onApiSettingsChange={(apiSettings) => {
              setSettings((s) => ({ ...s, apiSettings }));
            }}
          />
        );
      default:
        return null;
    }
  };

  // Show setup screen if API not configured
  if (!apiConfigured) {
    return (
      <SetupView
        onComplete={(apiSettings: ApiSettings) => {
          setSettings((s) => ({ ...s, apiSettings }));
          // Reload profile from session
          const session = loadAuthSession();
          if (session?.tenantProfile) {
            setTenantProfile(session.tenantProfile);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`flex h-screen overflow-hidden bg-[#05070a] text-white font-sans transition-all duration-300 ${flashScreen ? 'ring-[20px] ring-[#ff3d03]/50' : ''}`}
      style={{ fontSize: `${settings.printerSettings.uiScale}%` }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tenantProfile={tenantProfile} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#05070a]">
        <Header
          isSyncing={!!error}
          lastChecked={lastChecked}
          onRefresh={forceRefresh}
          error={error}
          onLogout={handleLogout}
        />

        <div className="flex-1 overflow-y-auto px-6 py-8 md:p-12 lg:p-16 no-print">
          <div className="max-w-[1600px] mx-auto pb-24 md:pb-0">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* PrintableArea is rendered inside OrdersList when needed */}
    </div>
  );
};

export default App;
