export type PanelConfig = {
  KEYCLOAK_ORIGIN: string;
  KEYCLOAK_REALM: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;

  GRAFANA_ORIGIN: string;

  PANEL_ORIGIN: string;
  PANEL_COOKIE_TTL_SECONDS: number;
  PANEL_USER_EMAIL: string;

  DATABASE_NAME: string;
  DATABASE_CONNECTION_URI: string;

  LOGGING_TAG: string;
  LOGGING_HOST: string;
  LOGGING_PORT: number;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  id_token: string;
  session_state: string;
  scope: string;
};

export type UserInfo = {
  sub: string;
  email_verified: boolean;
  preferred_username: string;
  email: string;
};
