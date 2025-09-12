/**
 * Componente per visualizzare e gestire i dati dell'onboarding
 * Mostra lo stato dei dati, conflitti, e permette di gestire la migrazione
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Download, 
  Upload, 
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  FileText,
  Trash2
} from 'lucide-react';
import { 
  onboardingDataManager,
  getOnboardingStatus,
  getOnboardingData,
  getMappedData,
  getConflicts,
  createOnboardingReport,
  exportOnboardingData
} from '../utils/onboardingDataManager';

const OnboardingDataViewer = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(null);
  const [normalizedData, setNormalizedData] = useState(null);
  const [mappedData, setMappedData] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Carica i dati quando il componente si monta
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentStatus = getOnboardingStatus();
      const currentNormalizedData = getOnboardingData();
      const currentMappedData = getMappedData();
      const currentConflicts = getConflicts();
      const currentReport = createOnboardingReport();

      setStatus(currentStatus);
      setNormalizedData(currentNormalizedData);
      setMappedData(currentMappedData);
      setConflicts(currentConflicts);
      setReport(currentReport);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExport = (format = 'json') => {
    try {
      const data = exportOnboardingData(format);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleCleanup = () => {
    if (window.confirm('Sei sicuro di voler pulire i dati temporanei? Questa operazione non può essere annullata.')) {
      onboardingDataManager.cleanup();
      loadData();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: BarChart3 },
    { id: 'normalized', label: 'Dati Normalizzati', icon: Database },
    { id: 'mapped', label: 'Dati Mappati', icon: Settings },
    { id: 'conflicts', label: 'Conflitti', icon: AlertTriangle },
    { id: 'report', label: 'Report', icon: FileText }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inizializzato</p>
              <p className="text-2xl font-bold text-gray-900">
                {status?.isInitialized ? 'Sì' : 'No'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${status?.isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dati Correnti</p>
              <p className="text-2xl font-bold text-gray-900">
                {status?.hasCurrentData ? 'Sì' : 'No'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${status?.hasCurrentData ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dati Normalizzati</p>
              <p className="text-2xl font-bold text-gray-900">
                {status?.hasNormalizedData ? 'Sì' : 'No'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${status?.hasNormalizedData ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conflitti</p>
              <p className="text-2xl font-bold text-gray-900">
                {status?.conflictsCount || 0}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${status?.conflictsCount > 0 ? 'bg-yellow-500' : 'bg-green-500'}`} />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
          <Button onClick={() => handleExport('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Esporta JSON
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Esporta CSV
          </Button>
          <Button onClick={handleCleanup} variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Pulisci Dati
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderNormalizedData = () => (
    <div className="space-y-4">
      {normalizedData ? (
        Object.keys(normalizedData).map(section => (
          <Card key={section} className="p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(`normalized_${section}`)}
            >
              <h4 className="text-lg font-semibold capitalize">{section}</h4>
              {expandedSections[`normalized_${section}`] ? 
                <EyeOff className="w-5 h-5" /> : 
                <Eye className="w-5 h-5" />
              }
            </div>
            {expandedSections[`normalized_${section}`] && (
              <div className="mt-4">
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(normalizedData[section], null, 2)}
                </pre>
              </div>
            )}
          </Card>
        ))
      ) : (
        <Card className="p-8 text-center">
          <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nessun dato normalizzato disponibile</p>
        </Card>
      )}
    </div>
  );

  const renderMappedData = () => (
    <div className="space-y-4">
      {mappedData ? (
        Object.keys(mappedData).map(section => (
          <Card key={section} className="p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(`mapped_${section}`)}
            >
              <h4 className="text-lg font-semibold capitalize">{section}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {Array.isArray(mappedData[section]) ? mappedData[section].length : 1} elementi
                </span>
                {expandedSections[`mapped_${section}`] ? 
                  <EyeOff className="w-5 h-5" /> : 
                  <Eye className="w-5 h-5" />
                }
              </div>
            </div>
            {expandedSections[`mapped_${section}`] && (
              <div className="mt-4">
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(mappedData[section], null, 2)}
                </pre>
              </div>
            )}
          </Card>
        ))
      ) : (
        <Card className="p-8 text-center">
          <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nessun dato mappato disponibile</p>
        </Card>
      )}
    </div>
  );

  const renderConflicts = () => (
    <div className="space-y-4">
      {conflicts.length > 0 ? (
        conflicts.map((conflict, index) => (
          <Card key={index} className="p-4 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{conflict.message}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Sezione: {conflict.section} | Tipo: {conflict.type}
                </p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Elementi coinvolti:</p>
                  <div className="mt-1 space-y-1">
                    {conflict.items.slice(0, 3).map((item, itemIndex) => (
                      <div key={itemIndex} className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        {item.name || item.id || 'Elemento senza nome'}
                      </div>
                    ))}
                    {conflict.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        ... e altri {conflict.items.length - 3} elementi
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <p className="text-gray-600">Nessun conflitto rilevato</p>
        </Card>
      )}
    </div>
  );

  const renderReport = () => (
    <div className="space-y-4">
      {report ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Report Completo</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
            {JSON.stringify(report, null, 2)}
          </pre>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nessun report disponibile</p>
        </Card>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'normalized':
        return renderNormalizedData();
      case 'mapped':
        return renderMappedData();
      case 'conflicts':
        return renderConflicts();
      case 'report':
        return renderReport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Gestione Dati Onboarding</h2>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Caricamento...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingDataViewer;
