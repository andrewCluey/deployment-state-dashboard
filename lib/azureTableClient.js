async function getAccessToken() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://storage.azure.com/.default',
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get access token: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchPipelineStatuses() {
  const account = process.env.AZURE_STORAGE_ACCOUNT;
  const table = process.env.AZURE_TABLE_NAME || 'PipelineStatus';

  if (!account) {
    throw new Error('AZURE_STORAGE_ACCOUNT environment variable is not set.');
  }

  const token = await getAccessToken();

  const url = `https://${account}.table.core.windows.net/${table}()`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json;odata=nometadata',
      'x-ms-version': '2020-12-06',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Azure Table Storage error ${response.status}: ${text}`);
  }

  const data = await response.json();

  return data.value.map(entity => ({
    partitionKey:  entity.PartitionKey,
    rowKey:        entity.RowKey,
    status:        entity.Status        ?? null,
    version:       entity.Version       ?? null,
    lastUpdated:   entity.LastUpdated   ?? null,
    pipelineRunId: entity.PipelineRunId ?? null,
    commit:        entity.Commit        ?? null,
  }));
}