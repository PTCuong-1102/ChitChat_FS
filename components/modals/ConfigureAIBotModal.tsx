import React, { useState, useEffect } from 'react';
import { XIcon } from '../icons/Icons';

interface ConfigureAIBotModalProps {
  onClose: () => void;
  onConfigure: (botName: string, model: string, provider: string, apiKey: string) => void;
}

const LLM_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    models: [{ id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }],
  },
  // Future providers can be added here
  openai: {
    name: 'OpenAI (Coming Soon)',
    models: [],
  },
  mistral: {
    name: 'Mistral AI (Coming Soon)',
    models: [],
  }
};

const ConfigureAIBotModal: React.FC<ConfigureAIBotModalProps> = ({ onClose, onConfigure }) => {
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [botName, setBotName] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    // Reset model when provider changes
    setModel('');
    if (provider === 'gemini') {
        setModel(LLM_PROVIDERS.gemini.models[0].id);
    }
  }, [provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botName.trim() && model && provider && apiKey.trim()) {
      onConfigure(botName.trim(), model, provider, apiKey.trim());
      onClose();
    }
  };
  
  const isFormValid = botName.trim() && model && provider && apiKey.trim();
  const isProviderSelected = !!provider;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Configure AI Bot</h2>
        <p className="text-gray-500 mb-6">
          Set up your AI assistant by selecting a provider and providing your credentials.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700 mb-1">LLM Provider</label>
            <select
              id="llmProvider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-pink-200 focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="" disabled>Select a provider</option>
              {Object.entries(LLM_PROVIDERS).map(([id, { name, models }]) => (
                <option key={id} value={id} disabled={models.length === 0}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full px-4 py-3 rounded-lg bg-white border border-pink-200 focus:border-pink-500 focus:outline-none transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              required
              disabled={!isProviderSelected}
            />
          </div>

          <div>
            <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
            <select
              id="aiModel"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-pink-200 focus:border-pink-500 focus:outline-none transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={!isProviderSelected || LLM_PROVIDERS[provider as keyof typeof LLM_PROVIDERS]?.models.length === 0}
            >
              <option value="" disabled>Select a model</option>
              {provider && LLM_PROVIDERS[provider as keyof typeof LLM_PROVIDERS]?.models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="botName" className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              id="botName"
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Enter a friendly name for your bot..."
              className="w-full px-4 py-3 rounded-lg bg-white border border-pink-200 focus:border-pink-500 focus:outline-none transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              required
              disabled={!isProviderSelected}
            />
          </div>
          
          <div className="pt-4">
             <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg mb-4 border border-amber-200">
                <p><strong>Security Warning:</strong> API keys are handled in the browser and stored only for this session. For maximum security, always prefer applications that manage keys on a secure backend. Do not leave this page open in untrusted environments.</p>
             </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ✓ Configure Bot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigureAIBotModal;