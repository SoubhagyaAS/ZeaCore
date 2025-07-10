import React, { useState } from 'react';
import { X, Package, Globe, Tag, Loader2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddAppFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddAppForm: React.FC<AddAppFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'active',
    app_url: '',
    api_endpoint: '',
    api_key: '',
    version: '1.0.0',
    logo_url: null as string | null,
    screenshots: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    'Productivity',
    'Communication',
    'Analytics',
    'Storage',
    'Security',
    'Marketing',
    'Finance',
    'Development',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('apps')
        .insert([{
          name: formData.name,
          description: formData.description,
          category: formData.category,
          status: formData.status,
          app_url: formData.app_url,
          api_endpoint: formData.api_endpoint || null,
          api_key: formData.api_key || null,
          version: formData.version,
          logo_url: formData.logo_url,
          screenshots_urls: formData.screenshots,
          subscribers: 0,
          revenue: 0,
          features: []
        }]);

      if (error) throw error;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    try {
      const imageUrls: string[] = [];
      
      for (const file of validFiles) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError('Each image must be less than 5MB');
          return;
        }

        // Convert to base64 for preview (in production, you'd upload to a storage service)
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        const base64Url = await base64Promise;
        imageUrls.push(base64Url);
      }

      if (formData.logo_url === null && imageUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          logo_url: imageUrls[0],
          screenshots: imageUrls.slice(1)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          screenshots: [...prev.screenshots, ...imageUrls]
        }));
      }
    } catch (err) {
      setError('Failed to process images');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const setAsLogo = (screenshotUrl: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      logo_url: screenshotUrl,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New App</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline mr-1" />
              App Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter app name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what your app does"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              App URL
            </label>
            <input
              type="url"
              name="app_url"
              value={formData.app_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourapp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.0.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Endpoint
            </label>
            <input
              type="url"
              name="api_endpoint"
              value={formData.api_endpoint}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://api.yourapp.com/features"
            />
            <p className="text-xs text-gray-500 mt-1">Endpoint to fetch features and their codes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              name="api_key"
              value={formData.api_key}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter API key for third-party integration"
            />
            <p className="text-xs text-gray-500 mt-1">API key to authenticate with third-party service</p>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <Upload className="h-4 w-4 inline mr-1" />
            App Images (Logo & Screenshots)
          </label>
          
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop images here
            </p>
            <p className="text-gray-600 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </label>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG up to 5MB each. First image will be used as logo.
            </p>
          </div>
        </div>

        {/* Logo Preview */}
        {formData.logo_url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App Logo
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={formData.logo_url}
                alt="App logo"
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logo_url: null }))}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove Logo
              </button>
            </div>
          </div>
        )}

        {/* Screenshots Preview */}
        {formData.screenshots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshots ({formData.screenshots.length})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    {!formData.logo_url && (
                      <button
                        type="button"
                        onClick={() => setAsLogo(screenshot, index)}
                        className="text-white text-xs bg-blue-600 px-2 py-1 rounded"
                      >
                        Set as Logo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add App'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppForm;