/**
 * Webhook Configuration
 * Centralized management for webhook URLs
 */

/**
 * Get webhook base URL from environment variable
 * Falls back to default if not set
 */
export function getWebhookBaseUrl(): string {
  return process.env.WEBHOOK_BASE_URL || 'https://n8n.thietkelx.com/webhook-test';
}

/**
 * Get full webhook URL for mail endpoint
 * @param endpoint - Optional endpoint path (default: 'mail')
 * @param params - Optional query parameters
 */
export function getWebhookUrl(endpoint: string = 'mail', params?: Record<string, string>): string {
  const baseUrl = getWebhookBaseUrl();
  let url = `${baseUrl}/${endpoint}`;
  
  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryString}`;
  }
  
  return url;
}

/**
 * Get webhook URL for mail with optional ID parameter
 * @param id - Optional token/mail ID
 */
export function getMailWebhookUrl(id?: string): string {
  return id ? getWebhookUrl('mail', { id }) : getWebhookUrl('mail');
}

