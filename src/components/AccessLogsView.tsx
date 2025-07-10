import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Calendar, User, Globe, Loader2, RefreshCw, Download, Eye, EyeOff, Info } from 'lucide-react';
import { useAccessLogs } from '../hooks/useUserManagement';
import { accessLogger } from '../lib/accessLogger';

const AccessLogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const { logs, loading, error, refetch } = useAccessLogs();

  // Log access to this page
  useEffect(() => {
    accessLogger.logRead('access_logs', undefined, 'Access Logs Page');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading access logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading access logs: {error}</p>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resource_name && log.resource_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip_address && log.ip_address.includes(searchTerm)) ||
      (log.user_agent && log.user_agent.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  const handleRefresh = async () => {
    await accessLogger.logRead('access_logs', undefined, 'Refresh Access Logs');
    refetch();
  };

  const handleExport = async () => {
    await accessLogger.logExport('access_logs', 'csv');
    // Export functionality would go here
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetails(true);
    accessLogger.logRead('access_logs', log.id, 'View Log Details');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Access Logs</h2>
          <p className="text-charcoal-light">Monitor user activities and system access</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
            title="Refresh logs"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
            title="Export logs"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          
          <div className="flex items-center text-sm text-charcoal-light">
            <Filter className="h-4 w-4 mr-2" />
            {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-gray">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-soft-white divide-y divide-light-gray">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer" onClick={() => handleViewDetails(log)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Calendar className="h-4 w-4 mr-2 text-charcoal-light" />
                      <div>
                        <div>{new Date(log.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-charcoal-light">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-royal-blue to-sky-blue flex items-center justify-center">
                          <User className="h-4 w-4 text-soft-white" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-charcoal">
                          {log.user_id ? `User ${log.user_id.slice(0, 8)}...` : 'Anonymous'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                    <div>
                      <div className="font-medium">{log.resource}</div>
                      {log.resource_name && (
                        <div className="text-xs text-charcoal-light">{log.resource_name}</div>
                      )}
                      {log.resource_id && (
                        <div className="text-xs text-charcoal-light">ID: {log.resource_id.slice(0, 8)}...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Globe className="h-4 w-4 mr-2 text-charcoal-light" />
                      {log.ip_address || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-charcoal">
                      {log.request_method || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-royal-blue hover:text-royal-blue-dark"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(log);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No access logs found</h3>
          <p className="text-charcoal-light">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-soft-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-charcoal">Log Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-charcoal-light hover:text-charcoal"
              >
                <EyeOff className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-charcoal">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Action:</span>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Resource:</span>
                    <span className="text-charcoal">{selectedLog.resource}</span>
                  </div>
                  {selectedLog.resource_name && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Resource Name:</span>
                      <span className="text-charcoal">{selectedLog.resource_name}</span>
                    </div>
                  )}
                  {selectedLog.resource_id && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Resource ID:</span>
                      <span className="text-charcoal font-mono text-sm">{selectedLog.resource_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Timestamp:</span>
                    <span className="text-charcoal">{new Date(selectedLog.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-charcoal">Request Information</h4>
                <div className="space-y-2">
                  {selectedLog.request_method && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Method:</span>
                      <span className="text-charcoal">{selectedLog.request_method}</span>
                    </div>
                  )}
                  {selectedLog.request_url && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">URL:</span>
                      <span className="text-charcoal text-sm break-all">{selectedLog.request_url}</span>
                    </div>
                  )}
                  {selectedLog.response_status && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Status:</span>
                      <span className={`text-sm ${
                        selectedLog.response_status >= 200 && selectedLog.response_status < 300 
                          ? 'text-green-600' 
                          : selectedLog.response_status >= 400 
                            ? 'text-red-600' 
                            : 'text-yellow-600'
                      }`}>
                        {selectedLog.response_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Network Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-charcoal">Network Information</h4>
                <div className="space-y-2">
                  {selectedLog.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">IP Address:</span>
                      <span className="text-charcoal font-mono text-sm">{selectedLog.ip_address}</span>
                    </div>
                  )}
                  {selectedLog.session_id && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Session ID:</span>
                      <span className="text-charcoal font-mono text-sm">{selectedLog.session_id}</span>
                    </div>
                  )}
                  {selectedLog.user_agent && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">User Agent:</span>
                      <span className="text-charcoal text-sm break-all">{selectedLog.user_agent}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Browser Information */}
              {selectedLog.browser_info && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-charcoal">Browser Information</h4>
                  <div className="space-y-2">
                    {selectedLog.browser_info.platform && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Platform:</span>
                        <span className="text-charcoal">{selectedLog.browser_info.platform}</span>
                      </div>
                    )}
                    {selectedLog.browser_info.language && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Language:</span>
                        <span className="text-charcoal">{selectedLog.browser_info.language}</span>
                      </div>
                    )}
                    {selectedLog.browser_info.screen && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Screen:</span>
                        <span className="text-charcoal">{selectedLog.browser_info.screen.width}x{selectedLog.browser_info.screen.height}</span>
                      </div>
                    )}
                    {selectedLog.browser_info.timeZone && (
                      <div className="flex justify-between">
                        <span className="text-charcoal-light">Timezone:</span>
                        <span className="text-charcoal">{selectedLog.browser_info.timeZone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            {selectedLog.metadata && (
              <div className="mt-6">
                <h4 className="font-semibold text-charcoal mb-3">Additional Information</h4>
                <div className="bg-light-gray rounded-lg p-4">
                  <pre className="text-sm text-charcoal overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Request/Response Bodies */}
            {(selectedLog.request_body || selectedLog.response_body) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLog.request_body && (
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Request Body</h4>
                    <div className="bg-light-gray rounded-lg p-4">
                      <pre className="text-sm text-charcoal overflow-x-auto">
                        {JSON.stringify(selectedLog.request_body, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {selectedLog.response_body && (
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Response Body</h4>
                    <div className="bg-light-gray rounded-lg p-4">
                      <pre className="text-sm text-charcoal overflow-x-auto">
                        {JSON.stringify(selectedLog.response_body, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessLogsView;