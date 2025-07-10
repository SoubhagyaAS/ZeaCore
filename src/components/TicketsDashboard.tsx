import React, { useState } from 'react';
import { 
  Ticket, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Users, 
  Calendar,
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
  Flag,
  Loader2,
  List
} from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import { useApps, useCustomers } from '../hooks/useSupabaseData';
import { useToast } from '../context/ToastContext';
import StatusIcon from './common/StatusIcon';
import CreateTicketForm from './forms/CreateTicketForm';

interface TicketsDashboardProps {
  onNavigateToTicketsList?: () => void;
}

const TicketsDashboard: React.FC<TicketsDashboardProps> = ({ onNavigateToTicketsList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { 
    tickets, 
    categories, 
    priorities, 
    statuses, 
    loading, 
    error, 
    getTicketStats,
    deleteTicket 
  } = useTickets();
  
  const { apps } = useApps();
  const { customers } = useCustomers();
  const { showToast } = useToast();

  const stats = getTicketStats();

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status?.name === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority?.level === parseInt(selectedPriority);
    const matchesCategory = selectedCategory === 'all' || ticket.category_id === selectedCategory;
    const matchesApp = selectedApp === 'all' || ticket.app_id === selectedApp;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesApp;
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
          <h1 className="text-3xl font-bold text-charcoal">Tickets Dashboard</h1>
          <p className="text-charcoal-light mt-2">Overview and analytics for support tickets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Ticket
          </button>
          <button 
            onClick={onNavigateToTicketsList}
            className="btn-secondary flex items-center"
          >
            <List className="h-5 w-5 mr-2" />
            View All Tickets
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Total Tickets</p>
              <p className="text-2xl font-bold text-charcoal">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl flex items-center justify-center">
              <Ticket className="h-6 w-6 text-soft-white" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Open Tickets</p>
              <p className="text-2xl font-bold text-charcoal">{stats.open}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-soft-white" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">In Progress</p>
              <p className="text-2xl font-bold text-charcoal">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-soft-white" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Resolution Rate</p>
              <p className="text-2xl font-bold text-charcoal">{stats.resolutionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-soft-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      {(stats.critical > 0 || stats.high > 0) && (
        <div className="card p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Priority Alerts</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.critical > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-red-700 font-medium">{stats.critical} Critical tickets</span>
              </div>
            )}
            {stats.high > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-orange-700 font-medium">{stats.high} High priority tickets</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

          {/* App Filter */}
          <div>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="input-field"
            >
              <option value="all">All Apps</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid/List */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-charcoal">
            Tickets ({filteredTickets.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-royal-blue text-soft-white' : 'text-charcoal-light hover:bg-gray-100'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-royal-blue text-soft-white' : 'text-charcoal-light hover:bg-gray-100'}`}
            >
              <div className="w-4 h-4 space-y-0.5">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal mb-2 line-clamp-2">{ticket.title}</h3>
                    <p className="text-sm text-charcoal-light line-clamp-3">{ticket.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-1 text-charcoal-light hover:text-royal-blue">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-charcoal-light hover:text-royal-blue">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-1 text-charcoal-light hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Status and Priority */}
                  <div className="flex items-center justify-between">
                    {ticket.status && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status.name)}`}>
                        {ticket.status.name}
                      </span>
                    )}
                    {ticket.priority && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority.level)}`}>
                        {ticket.priority.name}
                      </span>
                    )}
                  </div>

                  {/* Customer and App */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-charcoal-light mr-1" />
                      <span className="text-charcoal">{ticket.customer?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-charcoal-light mr-1" />
                      <span className="text-charcoal">{ticket.app?.name || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Assigned User */}
                  {ticket.assigned_user && (
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-charcoal-light mr-1" />
                      <span className="text-charcoal">
                        {ticket.assigned_user.first_name} {ticket.assigned_user.last_name}
                      </span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center text-sm text-charcoal-light">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="card p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-charcoal">{ticket.title}</h3>
                      {ticket.status && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status.name)}`}>
                          {ticket.status.name}
                        </span>
                      )}
                      {ticket.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority.level)}`}>
                          {ticket.priority.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-charcoal-light mt-1">{ticket.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-charcoal-light">
                      <span>{ticket.customer?.name}</span>
                      <span>•</span>
                      <span>{ticket.app?.name}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-charcoal-light hover:text-royal-blue">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-charcoal-light hover:text-royal-blue">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-2 text-charcoal-light hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No tickets found</h3>
            <p className="text-charcoal-light">
              {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all' || selectedApp !== 'all'
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

export default TicketsDashboard; 