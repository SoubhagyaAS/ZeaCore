import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { useApps, useCustomers } from '../../hooks/useSupabaseData';
import { useToast } from '../../context/ToastContext';
import { Tables } from '../../types/database';

interface CreateTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    app_id: '',
    plan_id: '',
    category_id: '',
    priority_id: '',
    status_id: '',
    assigned_to: '',
    due_date: '',
    estimated_hours: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createTicket, categories, priorities, statuses } = useTickets();
  const { apps } = useApps();
  const { customers } = useCustomers();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const ticketData: Tables['tickets']['Insert'] = {
        title: formData.title,
        description: formData.description,
        customer_id: formData.customer_id,
        app_id: formData.app_id,
        plan_id: formData.plan_id || null,
        category_id: formData.category_id || null,
        priority_id: formData.priority_id || null,
        status_id: formData.status_id || null,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null,
        estimated_hours: parseFloat(formData.estimated_hours) || 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      await createTicket(ticketData);
      showToast('Ticket created successfully', 'success');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        customer_id: '',
        app_id: '',
        plan_id: '',
        category_id: '',
        priority_id: '',
        status_id: '',
        assigned_to: '',
        due_date: '',
        estimated_hours: '',
        tags: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showToast('Failed to create ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-charcoal">Create New Ticket</h2>
          <button 
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="input-field"
              placeholder="Enter ticket title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Describe the issue or request"
              required
            />
          </div>

          {/* Customer and App */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Customer *
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Application *
              </label>
              <select
                value={formData.app_id}
                onChange={(e) => handleInputChange('app_id', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select application</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Priority
              </label>
              <select
                value={formData.priority_id}
                onChange={(e) => handleInputChange('priority_id', e.target.value)}
                className="input-field"
              >
                <option value="">Select priority</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Status
              </label>
              <select
                value={formData.status_id}
                onChange={(e) => handleInputChange('status_id', e.target.value)}
                className="input-field"
              >
                <option value="">Select status</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Estimated Hours and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="input-field"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-light-gray">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketForm; 