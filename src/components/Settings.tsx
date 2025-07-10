import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Database, Mail, Globe, Key, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: 'SaaS Management Corp',
    companyEmail: 'admin@saasmanagement.com',
    timezone: 'UTC-8',
    currency: 'USD',
    notifications: {
      newSubscriptions: true,
      paymentFailed: true,
      trialExpiring: true,
      monthlyReports: false
    },
    security: {
      twoFactorAuth: true,
      apiAccess: true,
      autoLogout: 30
    },
    billing: {
      taxRate: 8.5,
      invoicePrefix: 'INV-',
      paymentGracePeriod: 3
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load settings from database on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would fetch settings from a settings table
      // For now, we'll use localStorage as a fallback
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate settings
      if (!settings.companyName.trim()) {
        throw new Error('Company name is required');
      }
      if (!settings.companyEmail.trim()) {
        throw new Error('Company email is required');
      }
      if (settings.billing.taxRate < 0 || settings.billing.taxRate > 100) {
        throw new Error('Tax rate must be between 0 and 100');
      }
      if (settings.security.autoLogout < 5 || settings.security.autoLogout > 480) {
        throw new Error('Auto logout must be between 5 and 480 minutes');
      }

      // In a real implementation, you would save to a database table
      // For now, we'll save to localStorage and simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      // You could also save to a user_settings table in Supabase:
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings: settings,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      */

      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleSecurityChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const handleBillingChange = (key: string, value: number | string) => {
    setSettings(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Settings</h1>
          <p className="text-charcoal-light mt-2">Configure your SaaS management platform</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : success ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {saving ? 'Saving...' : success ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Settings saved successfully!</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* General Settings */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Globe className="h-5 w-5 text-royal-blue mr-2" />
          <h2 className="text-lg font-semibold text-charcoal">General Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              className="input-field"
              placeholder="Enter company name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Company Email</label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
              className="input-field"
              placeholder="Enter company email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="input-field"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">GMT (UTC+0)</option>
              <option value="UTC+1">Central European Time (UTC+1)</option>
              <option value="UTC+2">Eastern European Time (UTC+2)</option>
              <option value="UTC+9">Japan Standard Time (UTC+9)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
              className="input-field"
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="CAD">Canadian Dollar (CAD)</option>
              <option value="AUD">Australian Dollar (AUD)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-5 w-5 text-royal-blue mr-2" />
          <h2 className="text-lg font-semibold text-charcoal">Notification Settings</h2>
        </div>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-light-gray rounded-xl">
              <div>
                <p className="font-medium text-charcoal capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm text-charcoal-light">
                  {key === 'newSubscriptions' && 'Get notified when new customers subscribe'}
                  {key === 'paymentFailed' && 'Alert when payment processing fails'}
                  {key === 'trialExpiring' && 'Remind when customer trials are ending'}
                  {key === 'monthlyReports' && 'Receive monthly analytics reports'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 ${
                  value ? 'bg-royal-blue' : 'bg-light-gray border border-charcoal-light'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-soft-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-5 w-5 text-royal-blue mr-2" />
          <h2 className="text-lg font-semibold text-charcoal">Security Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-light-gray rounded-xl">
            <div>
              <p className="font-medium text-charcoal">Two-Factor Authentication</p>
              <p className="text-sm text-charcoal-light">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => handleSecurityChange('twoFactorAuth', !settings.security.twoFactorAuth)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 ${
                settings.security.twoFactorAuth ? 'bg-royal-blue' : 'bg-light-gray border border-charcoal-light'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-soft-white transition-transform ${
                  settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-light-gray rounded-xl">
            <div>
              <p className="font-medium text-charcoal">API Access</p>
              <p className="text-sm text-charcoal-light">Allow external applications to access your data</p>
            </div>
            <button
              onClick={() => handleSecurityChange('apiAccess', !settings.security.apiAccess)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 ${
                settings.security.apiAccess ? 'bg-royal-blue' : 'bg-light-gray border border-charcoal-light'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-soft-white transition-transform ${
                  settings.security.apiAccess ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="p-4 bg-light-gray rounded-xl">
            <label className="block text-sm font-medium text-charcoal mb-2">Auto Logout (minutes)</label>
            <input
              type="number"
              min="5"
              max="480"
              value={settings.security.autoLogout}
              onChange={(e) => handleSecurityChange('autoLogout', parseInt(e.target.value) || 30)}
              className="input-field w-32"
              placeholder="30"
            />
            <p className="text-xs text-charcoal-light mt-1">Automatically log out after inactivity (5-480 minutes)</p>
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Database className="h-5 w-5 text-royal-blue mr-2" />
          <h2 className="text-lg font-semibold text-charcoal">Billing Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.billing.taxRate}
              onChange={(e) => handleBillingChange('taxRate', parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="8.5"
            />
            <p className="text-xs text-charcoal-light mt-1">Default tax rate for invoices</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Invoice Prefix</label>
            <input
              type="text"
              value={settings.billing.invoicePrefix}
              onChange={(e) => handleBillingChange('invoicePrefix', e.target.value)}
              className="input-field"
              placeholder="INV-"
            />
            <p className="text-xs text-charcoal-light mt-1">Prefix for invoice numbers</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Payment Grace Period (days)</label>
            <input
              type="number"
              min="0"
              max="30"
              value={settings.billing.paymentGracePeriod}
              onChange={(e) => handleBillingChange('paymentGracePeriod', parseInt(e.target.value) || 0)}
              className="input-field"
              placeholder="3"
            />
            <p className="text-xs text-charcoal-light mt-1">Days before marking payment as overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;