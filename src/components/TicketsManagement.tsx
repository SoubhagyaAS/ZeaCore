import React, { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Tag,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3
} from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import { useToast } from '../context/ToastContext';
import CreateTicketForm from './forms/CreateTicketForm';

interface TicketsManagementProps {
  onNavigateToDashboard?: () => void;
}

const TicketsManagement: React.FC<TicketsManagementProps> = ({ onNavigateToDashboard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { 
    tickets, 
    categories, 
    priorities, 
    statuses, 
    loading, 
    error, 
    deleteTicket 
  } = useTickets();
  
  const { showToast } = useToast();

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status?.name === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority?.level === parseInt(selectedPriority);
    const matchesCategory = selectedCategory === 'all' || ticket.category_id === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
      showToast('Ticket deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete ticket', 'error');
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Open': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      case 'Closed': return 'text-gray-600 bg-gray-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'Open': return <AlertCircle className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      case 'Closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading tickets: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Tickets List</h1>
          <p className="text-charcoal-light mt-2">View and manage all support tickets</p>
        </div>
        <div className="flex items-center space-x-3">
          {onNavigateToDashboard && (
            <button 
              onClick={onNavigateToDashboard}
              className="btn-secondary flex items-center"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Dashboard
            </button>
          )}
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status.id} value={status.name}>{status.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="input-field"
            >
              <option value="all">All Priority</option>
              {priorities.map(priority => (
                <option key={priority.id} value={priority.level}>{priority.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-gray">
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Ticket</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">App</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Assigned</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-light-gray hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <h3 className="font-medium text-charcoal mb-1">{ticket.title}</h3>
                      <p className="text-sm text-charcoal-light line-clamp-2">{ticket.description}</p>
                      {ticket.category && (
                        <div className="flex items-center mt-2">
                          <Tag className="h-3 w-3 text-charcoal-light mr-1" />
                          <span className="text-xs text-charcoal-light">{ticket.category.name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-charcoal-light mr-2" />
                      <span className="text-sm text-charcoal">{ticket.customer?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-charcoal">{ticket.app?.name || 'Unknown'}</span>
                  </td>
                  <td className="py-4 px-4">
                    {ticket.status && (
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status.name)}`}>
                          {ticket.status.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {ticket.priority && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority.level)}`}>
                        {ticket.priority.name}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {ticket.assigned_user ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-charcoal-light mr-2" />
                        <span className="text-sm text-charcoal">
                          {ticket.assigned_user.first_name} {ticket.assigned_user.last_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-charcoal-light">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-charcoal-light mr-2" />
                      <span className="text-sm text-charcoal">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-lg transition-all"
                        title="View Ticket"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-lg transition-all"
                        title="Edit Ticket"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-2 text-charcoal-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No tickets found</h3>
            <p className="text-charcoal-light">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Create your first ticket to get started'
              }
            </p>
          </div>
        )}
      </div>

      <CreateTicketForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          // Refresh tickets after creation
        }}
      />
    </div>
  );
};

export default TicketsManagement; 