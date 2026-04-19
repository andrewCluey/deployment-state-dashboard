import { TableServiceClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';

const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const TABLE_NAME = process.env.AZURE_TABLE_NAME || 'PipelineStatus';

export async function fetchPipelineStatuses() {
  if (!STORAGE_ACCOUNT) {
    throw new Error(
      'AZURE_STORAGE_ACCOUNT environment variable is not set.'
    );
  }

  const endpoint = `https://${STORAGE_ACCOUNT}.table.core.windows.net`;
  const credential = new DefaultAzureCredential();
  const tableServiceClient = new TableServiceClient(endpoint, credential);
  const tableClient = tableServiceClient.getTableClient(TABLE_NAME);

  const entities = [];

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