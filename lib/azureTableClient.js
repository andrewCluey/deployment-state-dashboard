/**
 * lib/azureTableClient.js
 *
 * SERVER-SIDE ONLY — this file is never sent to the browser.
 * It runs exclusively inside Next.js API routes (pages/api/*).
 *
 * Authentication strategy (via DefaultAzureCredential):
 *
 *   LOCAL DEV:
 *     Set these three variables in .env.local —
 *       AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
 *     DefaultAzureCredential will pick them up automatically as
 *     EnvironmentCredential and use your dev Service Principal.
 *
 *   AZURE APP SERVICES:
 *     Enable System-assigned Managed Identity on the App Service.
 *     Grant it "Storage Table Data Reader" on the Storage Account.
 *     Do NOT set any credential env vars — DefaultAzureCredential
 *     will detect the Managed Identity automatically. No secrets needed.
 *
 * The same code runs in both environments without any changes.
 *   
 *   AZURE STORAGE ACCOUNT ENVIRONMENT VARIABLES:
 *     Whether using a service principal in local dev, or managed identity,
 *     The following Env variables should be set (or read from an .env file).
 *     For local Dev, env file or environment variables can be used.
 *     When running in An App Service, use the Apps Configuration settings.
 *       - AZURE_STORAGE_ACCOUNT
 *       - AZURE_TABLE_NAME
 */

import { TableServiceClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';

const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const TABLE_NAME = process.env.AZURE_TABLE_NAME || 'PipelineStatus';

if (!STORAGE_ACCOUNT) {
  throw new Error(
    'AZURE_STORAGE_ACCOUNT environment variable is not set. ' +
    'Add it to .env.local for local dev, or App Service Configuration for Azure.'
  );
}

const endpoint = `https://${STORAGE_ACCOUNT}.table.core.windows.net`;

// DefaultAzureCredential tries credential sources in order:
//   1. EnvironmentCredential   (AZURE_TENANT_ID + CLIENT_ID + CLIENT_SECRET)
//   2. WorkloadIdentityCredential
//   3. ManagedIdentityCredential  ← used in App Service
//   4. AzureCliCredential         ← useful for local dev with az login
//   5. ...and several more
//
// In practice: local dev uses EnvironmentCredential (SP), App Service uses ManagedIdentityCredential.
const credential = new DefaultAzureCredential();

const tableServiceClient = new TableServiceClient(endpoint, credential);
const tableClient = tableServiceClient.getTableClient(TABLE_NAME);

/**
 * Fetch all pipeline status entities from the table.
 * Returns a plain array of objects — safe to JSON-serialise.
 */
export async function fetchPipelineStatuses() {
  const entities = [];

  // listEntities() handles pagination automatically.
  // For very large tables (1000+ rows) this is still efficient —
  // it streams pages rather than loading everything into memory at once.
  for await (const entity of tableClient.listEntities()) {
    entities.push({
      partitionKey:  entity.partitionKey,
      rowKey:        entity.rowKey,
      status:        entity.status        ?? null,
      version:       entity.version       ?? null,
      lastUpdated:   entity.lastUpdated   ?? null,
      pipelineRunId: entity.pipelineRunId ?? null,
      commit:        entity.commit        ?? null,
    });
  }

  return entities;
}
