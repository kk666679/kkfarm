export interface IntegrationConfig {
  type: string;
  name: string;
  config: Record<string, unknown>;
  enabled?: boolean;
}

export interface IntegrationCreateParams {
  type: 'slack' | 'jira' | 'gitlab' | 'datadog';
  name: string;
  config: Record<string, unknown>;
}
