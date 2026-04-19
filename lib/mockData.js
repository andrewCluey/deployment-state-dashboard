/**
 * lib/mockData.js
 *
 * Used automatically when AZURE_STORAGE_ACCOUNT is not set.
 * Mirrors the real Azure Table Storage schema exactly.
 * Remove or ignore once connected to Azure.
 */

export const MOCK_DATA = [
  { partitionKey: 'api-gateway',      rowKey: 'dev',     status: 'succeeded',  version: 'v3.1.2', lastUpdated: '2026-04-18T09:45:00Z', pipelineRunId: '10011', commit: 'a1b2c3d' },
  { partitionKey: 'api-gateway',      rowKey: 'qa',      status: 'succeeded',  version: 'v3.1.1', lastUpdated: '2026-04-17T14:20:00Z', pipelineRunId: '10009', commit: 'e4f5g6h' },
  { partitionKey: 'api-gateway',      rowKey: 'sit',     status: 'failed',     version: 'v3.1.0', lastUpdated: '2026-04-17T11:05:00Z', pipelineRunId: '10008', commit: 'i7j8k9l' },
  { partitionKey: 'api-gateway',      rowKey: 'uat',     status: 'succeeded',  version: 'v3.0.9', lastUpdated: '2026-04-15T16:30:00Z', pipelineRunId: '10003', commit: 'm1n2o3p' },
  { partitionKey: 'api-gateway',      rowKey: 'preprod', status: 'succeeded',  version: 'v3.0.8', lastUpdated: '2026-04-14T10:00:00Z', pipelineRunId: '9998',  commit: 'q4r5s6t' },
  { partitionKey: 'api-gateway',      rowKey: 'prod',    status: 'succeeded',  version: 'v3.0.7', lastUpdated: '2026-04-12T08:00:00Z', pipelineRunId: '9990',  commit: 'u7v8w9x' },

  { partitionKey: 'auth-service',     rowKey: 'dev',     status: 'inprogress', version: 'v1.5.3', lastUpdated: '2026-04-18T10:30:00Z', pipelineRunId: '20045', commit: 'y1z2a3b' },
  { partitionKey: 'auth-service',     rowKey: 'qa',      status: 'succeeded',  version: 'v1.5.2', lastUpdated: '2026-04-18T08:10:00Z', pipelineRunId: '20042', commit: 'c4d5e6f' },
  { partitionKey: 'auth-service',     rowKey: 'sit',     status: 'succeeded',  version: 'v1.5.1', lastUpdated: '2026-04-17T17:00:00Z', pipelineRunId: '20039', commit: 'g7h8i9j' },
  { partitionKey: 'auth-service',     rowKey: 'uat',     status: 'failed',     version: 'v1.5.0', lastUpdated: '2026-04-16T12:45:00Z', pipelineRunId: '20035', commit: 'k1l2m3n' },
  { partitionKey: 'auth-service',     rowKey: 'preprod', status: 'succeeded',  version: 'v1.4.9', lastUpdated: '2026-04-10T09:00:00Z', pipelineRunId: '20020', commit: 'o4p5q6r' },
  { partitionKey: 'auth-service',     rowKey: 'prod',    status: 'succeeded',  version: 'v1.4.8', lastUpdated: '2026-04-08T07:30:00Z', pipelineRunId: '20015', commit: 's7t8u9v' },

  { partitionKey: 'user-profile',     rowKey: 'dev',     status: 'succeeded',  version: 'v2.2.0', lastUpdated: '2026-04-18T07:55:00Z', pipelineRunId: '30100', commit: 'w1x2y3z' },
  { partitionKey: 'user-profile',     rowKey: 'qa',      status: 'succeeded',  version: 'v2.2.0', lastUpdated: '2026-04-17T19:00:00Z', pipelineRunId: '30099', commit: 'a4b5c6d' },
  { partitionKey: 'user-profile',     rowKey: 'sit',     status: 'succeeded',  version: 'v2.1.9', lastUpdated: '2026-04-16T15:20:00Z', pipelineRunId: '30095', commit: 'e7f8g9h' },
  { partitionKey: 'user-profile',     rowKey: 'uat',     status: 'succeeded',  version: 'v2.1.8', lastUpdated: '2026-04-15T11:00:00Z', pipelineRunId: '30090', commit: 'i1j2k3l' },
  { partitionKey: 'user-profile',     rowKey: 'preprod', status: 'failed',     version: 'v2.1.7', lastUpdated: '2026-04-13T14:30:00Z', pipelineRunId: '30082', commit: 'm4n5o6p' },
  { partitionKey: 'user-profile',     rowKey: 'prod',    status: 'succeeded',  version: 'v2.1.6', lastUpdated: '2026-04-09T08:15:00Z', pipelineRunId: '30070', commit: 'q7r8s9t' },

  { partitionKey: 'notification-svc', rowKey: 'dev',     status: 'failed',     version: 'v0.9.1', lastUpdated: '2026-04-18T10:05:00Z', pipelineRunId: '40210', commit: 'u1v2w3x' },
  { partitionKey: 'notification-svc', rowKey: 'qa',      status: 'succeeded',  version: 'v0.9.0', lastUpdated: '2026-04-17T16:40:00Z', pipelineRunId: '40205', commit: 'y4z5a6b' },
  { partitionKey: 'notification-svc', rowKey: 'sit',     status: null,         version: null,      lastUpdated: null,                   pipelineRunId: null,    commit: null },
  { partitionKey: 'notification-svc', rowKey: 'uat',     status: null,         version: null,      lastUpdated: null,                   pipelineRunId: null,    commit: null },
  { partitionKey: 'notification-svc', rowKey: 'preprod', status: null,         version: null,      lastUpdated: null,                   pipelineRunId: null,    commit: null },
  { partitionKey: 'notification-svc', rowKey: 'prod',    status: null,         version: null,      lastUpdated: null,                   pipelineRunId: null,    commit: null },

  { partitionKey: 'reporting-api',    rowKey: 'dev',     status: 'succeeded',  version: 'v4.0.0', lastUpdated: '2026-04-18T09:00:00Z', pipelineRunId: '50300', commit: 'c7d8e9f' },
  { partitionKey: 'reporting-api',    rowKey: 'qa',      status: 'inprogress', version: 'v3.9.9', lastUpdated: '2026-04-18T10:25:00Z', pipelineRunId: '50301', commit: 'g1h2i3j' },
  { partitionKey: 'reporting-api',    rowKey: 'sit',     status: 'succeeded',  version: 'v3.9.8', lastUpdated: '2026-04-17T13:00:00Z', pipelineRunId: '50298', commit: 'k4l5m6n' },
  { partitionKey: 'reporting-api',    rowKey: 'uat',     status: 'succeeded',  version: 'v3.9.7', lastUpdated: '2026-04-16T10:30:00Z', pipelineRunId: '50295', commit: 'o7p8q9r' },
  { partitionKey: 'reporting-api',    rowKey: 'preprod', status: 'succeeded',  version: 'v3.9.6', lastUpdated: '2026-04-14T09:00:00Z', pipelineRunId: '50290', commit: 's1t2u3v' },
  { partitionKey: 'reporting-api',    rowKey: 'prod',    status: 'succeeded',  version: 'v3.9.5', lastUpdated: '2026-04-11T07:00:00Z', pipelineRunId: '50280', commit: 'w4x5y6z' },
];
