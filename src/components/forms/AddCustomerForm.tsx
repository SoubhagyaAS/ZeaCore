import React, { useState } from 'react';
import { X, User, Building, Mail, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../common/ImageUpload';

interface AddCustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    status: 'active',
    logo_url: null as string | null,
    country: '',
    state: '',
    phone: '',
    website: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('customers')
        .insert([formData]);

      if (error) throw error;

      setFormData({ 
        name: '', 
        email: '', 
        company: '', 
        status: 'active',
        logo_url: null,
        country: '',
        state: '',
        phone: '',
        website: '',
        notes: ''
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogoChange = (logoUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      logo_url: logoUrl
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Add New Customer</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              <Upload className="h-4 w-4 inline mr-1" />
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              <ImageUpload
                currentImage={formData.logo_url}
                onImageChange={handleLogoChange}
                placeholder="Company Logo"
                size="lg"
                shape="square"
              />
              <div className="text-sm text-charcoal-light">
                <p>Upload company logo</p>
                <p className="text-xs">Recommended: 256x256px, PNG or JPG</p>
              </div>
            </div>
          </div>

          {/* Basic Information - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter customer's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="customer@company.com"
              />
            </div>
          </div>

          {/* Company Information - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Company Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Location Information - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
                placeholder="United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-field"
                placeholder="California"
              />
            </div>
          </div>

          {/* Contact Information - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1-555-0123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input-field"
                placeholder="https://company.com"
              />
            </div>
          </div>

          {/* Notes - Full width */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Additional notes about the customer..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Add Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;