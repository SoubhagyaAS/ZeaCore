import { supabase } from './supabase';

export interface LogActionParams {
  action: string;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestBody?: any;
  responseStatus?: number;
  responseBody?: any;
  metadata?: any;
}

export interface LogAuthEventParams {
  action: 'login' | 'logout';
  userId?: string;
  metadata?: any;
}

class AccessLogger {
  private static instance: AccessLogger;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): AccessLogger {
    if (!AccessLogger.instance) {
      AccessLogger.instance = new AccessLogger();
    }
    return AccessLogger.instance;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getBrowserInfo() {
    if (typeof window === 'undefined') return null;

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const cookieEnabled = navigator.cookieEnabled;
    const onLine = navigator.onLine;
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const colorDepth = screen.colorDepth;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      userAgent,
      platform,
      language,
      cookieEnabled,
      onLine,
      screen: {
        width: screenWidth,
        height: screenHeight,
        colorDepth
      },
      timeZone,
      url: window.location.href,
      referrer: document.referrer
    };
  }

  private async getClientIP(): Promise<string | null> {
    try {
      // Try to get IP from a public service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not fetch client IP:', error);
      return null;
    }
  }

  public async logAction(params: LogActionParams): Promise<void> {
    try {
      const ipAddress = await this.getClientIP();
      const browserInfo = this.getBrowserInfo();

      const { data, error } = await supabase
        .from('access_logs')
        .insert({
          action: params.action,
          resource: params.resource,
          resource_id: params.resourceId,
          resource_name: params.resourceName,
          ip_address: ipAddress,
          user_agent: browserInfo?.userAgent || null,
          request_method: params.requestMethod,
          request_url: params.requestUrl,
          request_body: params.requestBody,
          response_status: params.responseStatus,
          response_body: params.responseBody,
          session_id: this.sessionId,
          browser_info: browserInfo,
          location_info: null, // Could be enhanced with geolocation
          metadata: params.metadata
        });

      if (error) {
        console.error('Error logging action:', error);
      }
    } catch (error) {
      console.error('Error in access logger:', error);
    }
  }

  public async logAuthEvent(params: LogAuthEventParams): Promise<void> {
    try {
      const ipAddress = await this.getClientIP();
      const browserInfo = this.getBrowserInfo();

      const { data, error } = await supabase
        .from('access_logs')
        .insert({
          user_id: params.userId,
          action: params.action,
          resource: 'auth',
          ip_address: ipAddress,
          user_agent: browserInfo?.userAgent || null,
          session_id: this.sessionId,
          browser_info: browserInfo,
          metadata: params.metadata
        });

      if (error) {
        console.error('Error logging auth event:', error);
      }
    } catch (error) {
      console.error('Error in auth logger:', error);
    }
  }

  // Convenience methods for common actions
  public async logLogin(userId?: string, metadata?: any): Promise<void> {
    await this.logAuthEvent({ action: 'login', userId, metadata });
  }

  public async logLogout(userId?: string, metadata?: any): Promise<void> {
    await this.logAuthEvent({ action: 'logout', userId, metadata });
  }

  public async logCreate(resource: string, resourceId?: string, resourceName?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'create',
      resource,
      resourceId,
      resourceName,
      requestMethod: 'POST',
      metadata
    });
  }

  public async logRead(resource: string, resourceId?: string, resourceName?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'read',
      resource,
      resourceId,
      resourceName,
      requestMethod: 'GET',
      metadata
    });
  }

  public async logUpdate(resource: string, resourceId?: string, resourceName?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'update',
      resource,
      resourceId,
      resourceName,
      requestMethod: 'PUT',
      metadata
    });
  }

  public async logDelete(resource: string, resourceId?: string, resourceName?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'delete',
      resource,
      resourceId,
      resourceName,
      requestMethod: 'DELETE',
      metadata
    });
  }

  public async logApprove(resource: string, resourceId?: string, resourceName?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'approve',
      resource,
      resourceId,
      resourceName,
      metadata
    });
  }

  public async logReject(resource: string, resourceId?: string, resourceName?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'reject',
      resource,
      resourceId,
      resourceName,
      metadata
    });
  }

  public async logExport(resource: string, format?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'export',
      resource,
      requestMethod: 'GET',
      metadata: { ...metadata, format }
    });
  }

  public async logImport(resource: string, format?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'import',
      resource,
      requestMethod: 'POST',
      metadata: { ...metadata, format }
    });
  }

  public async logSearch(resource: string, query?: string, filters?: any, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'search',
      resource,
      requestMethod: 'GET',
      metadata: { ...metadata, query, filters }
    });
  }

  public async logDownload(resource: string, resourceId?: string, resourceName?: string, format?: string, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'download',
      resource,
      resourceId,
      resourceName,
      requestMethod: 'GET',
      metadata: { ...metadata, format }
    });
  }

  public async logUpload(resource: string, fileName?: string, fileSize?: number, metadata?: any): Promise<void> {
    await this.logAction({
      action: 'upload',
      resource,
      requestMethod: 'POST',
      metadata: { ...metadata, fileName, fileSize }
    });
  }

  public async logError(error: Error, context?: any): Promise<void> {
    await this.logAction({
      action: 'error',
      resource: 'system',
      metadata: {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context
      }
    });
  }

  public async logSecurityEvent(event: string, details?: any): Promise<void> {
    await this.logAction({
      action: 'security',
      resource: 'system',
      metadata: {
        event,
        details
      }
    });
  }
}

export const accessLogger = AccessLogger.getInstance();
export default accessLogger; 