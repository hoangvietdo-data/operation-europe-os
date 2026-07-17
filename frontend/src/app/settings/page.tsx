"use client";

import { useState, useEffect } from "react";
import api from "@/store/api";
import { Settings2, Key, Bot, Save, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [providers, setProviders] = useState<any[]>([]);
  const [newProvider, setNewProvider] = useState({ provider_name: "openai", api_key: "", default_model: "gpt-4o", base_url: "" });

  useEffect(() => {
    fetchSettings();
    fetchProviders();
  }, []);

  const fetchSettings = () => {
    api.get("/settings").then(res => setSettings(res.data)).catch(console.error);
  };

  const fetchProviders = () => {
    api.get("/settings/ai-providers").then(res => setProviders(res.data)).catch(console.error);
  };

  const handleSettingsSave = async () => {
    try {
      await api.put("/settings", settings);
      alert("Settings saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/settings/ai-providers", newProvider);
      setNewProvider({ ...newProvider, api_key: "", base_url: "" });
      fetchProviders();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error adding provider");
    }
  };

  const setActiveProvider = async (provider_name: string) => {
    try {
      await api.put(`/settings/ai-providers/${provider_name}`, { is_active: true });
      fetchProviders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetProgress = async () => {
    if (confirm("Are you sure you want to reset all your progress? This will delete all XP, tasks, and study sessions. This action cannot be undone.")) {
      try {
        await api.post("/settings/reset-progress");
        alert("All progress has been reset successfully.");
      } catch (e) {
        console.error(e);
        alert("Failed to reset progress.");
      }
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Settings</h1>
        <p className="text-muted">Manage your preferences and AI Integrations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* General Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6 text-xl font-medium">
            <Settings2 className="w-5 h-5 text-white" />
            <h2>General Target</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Target Country</label>
              <input type="text" className="w-full bg-black border border-border rounded-lg p-2" 
                value={settings.country_preference || ""} onChange={e => setSettings({...settings, country_preference: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Career Goal</label>
              <input type="text" className="w-full bg-black border border-border rounded-lg p-2" 
                value={settings.career_goal || ""} onChange={e => setSettings({...settings, career_goal: e.target.value})} />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-muted mb-1">Current IELTS</label>
                <input type="text" className="w-full bg-black border border-border rounded-lg p-2" 
                  value={settings.current_ielts || ""} onChange={e => setSettings({...settings, current_ielts: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-muted mb-1">IELTS Target</label>
                <input type="text" className="w-full bg-black border border-border rounded-lg p-2" 
                  value={settings.ielts_target || ""} onChange={e => setSettings({...settings, ielts_target: e.target.value})} />
              </div>
            </div>
            <button onClick={handleSettingsSave} className="bg-white text-black px-4 py-2 rounded-md font-medium w-full flex justify-center items-center space-x-2 hover:bg-gray-200 transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-8">
          <div className="flex items-center space-x-2 mb-4 text-xl font-medium text-red-500">
            <AlertCircle className="w-5 h-5" />
            <h2>Danger Zone</h2>
          </div>
          <p className="text-sm text-red-400/80 mb-4">
            Resetting your progress will permanently delete all your XP, tasks, study sessions, and daily summaries. You will start from scratch.
          </p>
          <button 
            onClick={handleResetProgress} 
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md font-medium w-full flex justify-center items-center transition-colors"
          >
            <span>Reset All Progress</span>
          </button>
        </div>

        {/* AI API Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6 text-xl font-medium">
            <Bot className="w-5 h-5 text-white" />
            <h2>AI API Integration</h2>
          </div>

          <div className="mb-6 bg-black border border-border p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Rotate Models</p>
              <p className="text-xs text-muted">Randomly switch between available keys</p>
            </div>
            <button 
              onClick={() => {
                const newVal = !settings.auto_rotate_ai;
                setSettings({...settings, auto_rotate_ai: newVal});
                api.put("/settings", { auto_rotate_ai: newVal });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.auto_rotate_ai ? 'bg-green-500' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.auto_rotate_ai ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <form onSubmit={handleAddProvider} className="mb-6 space-y-3 p-4 border border-white/10 rounded-lg">
            <h3 className="text-sm font-medium mb-2 flex items-center space-x-2">
              <Key className="w-4 h-4" /> <span>Add New Provider</span>
            </h3>
            <div className="flex space-x-2">
              <select 
                className="bg-black border border-border rounded-md p-2 text-sm w-1/3"
                value={newProvider.provider_name}
                onChange={e => {
                  const val = e.target.value;
                  let defaultModel = "";
                  if (val === "openai") defaultModel = "gpt-4o";
                  else if (val === "gemini") defaultModel = "gemini-1.5-pro";
                  else if (val === "anthropic") defaultModel = "claude-3-5-sonnet-20240620";
                  else if (val === "groq") defaultModel = "llama3-8b-8192";
                  else if (val === "deepseek") defaultModel = "deepseek-coder";
                  
                  setNewProvider({...newProvider, provider_name: val, default_model: defaultModel, base_url: ""});
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="anthropic">Anthropic</option>
                <option value="groq">Groq</option>
                <option value="deepseek">DeepSeek</option>
                <option value="custom">Custom (Ollama)</option>
              </select>
              <input 
                type="text" 
                placeholder="Model (e.g. gpt-4o)" 
                className="bg-black border border-border rounded-md p-2 text-sm w-2/3"
                value={newProvider.default_model}
                onChange={e => setNewProvider({...newProvider, default_model: e.target.value})}
              />
            </div>
            
            {(newProvider.provider_name === "custom" || newProvider.provider_name === "deepseek") && (
              <input 
                type="text" 
                placeholder="Base URL (e.g. http://localhost:11434/v1)" 
                className="bg-black border border-border rounded-md p-2 w-full text-sm"
                value={newProvider.base_url}
                onChange={e => setNewProvider({...newProvider, base_url: e.target.value})}
              />
            )}
            
            <input 
              type="password" 
              placeholder="API Key (or blank for some local setups)" 
              className="bg-black border border-border rounded-md p-2 w-full text-sm"
              value={newProvider.api_key}
              onChange={e => setNewProvider({...newProvider, api_key: e.target.value})}
            />
            <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded-md text-sm font-medium hover:bg-blue-500">
              Add Key
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted">Saved Providers</h3>
            {providers.length === 0 && <p className="text-xs text-muted">No API keys added yet.</p>}
            {providers.map(p => (
              <div key={p.id} className={`p-3 rounded-lg border flex justify-between items-center ${p.is_active && !settings.auto_rotate_ai ? 'border-green-500 bg-green-500/10' : 'border-border bg-black'}`}>
                <div>
                  <p className="font-medium text-sm capitalize">{p.provider_name}</p>
                  <p className="text-xs text-muted">{p.default_model}</p>
                  {p.base_url && <p className="text-[10px] text-muted truncate max-w-[200px]">{p.base_url}</p>}
                </div>
                {!settings.auto_rotate_ai && (
                  <button 
                    onClick={() => setActiveProvider(p.provider_name)}
                    className={`text-xs px-3 py-1 rounded-full ${p.is_active ? 'bg-green-500 text-black' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {p.is_active ? 'Active' : 'Set Active'}
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
