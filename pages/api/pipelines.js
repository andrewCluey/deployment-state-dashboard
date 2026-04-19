/**
 * pages/api/pipelines.js
 *
 * GET /api/pipelines
 *
 * This is a Next.js API route. It runs on the SERVER — never in the browser.
 * The Azure credentials and SDK calls all happen here, server-side.
 *
 * The React frontend calls this endpoint and receives plain JSON.
 * It never touches Azure directly, and never sees any credentials.
 */

const USE_MOCK = !process.env.AZURE_STORAGE_ACCOUNT;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let data;

    if (USE_MOCK) {
      // No Azure config found — return mock data for local development
      const { MOCK_DATA } = await import('../../lib/mockData');
      // Simulate a small network delay so loading states are visible
      await new Promise(r => setTimeout(r, 400));
      data = MOCK_DATA;
    } else {
      // Production path — fetch from Azure Table Storage using Managed Identity
      // (or Service Principal in local dev via environment variables)
      const { fetchPipelineStatuses } = await import('../../lib/azureTableClient');
      data = await fetchPipelineStatuses();
    }

    // Cache for 30 seconds on the server — reduces Azure calls on busy dashboards.
    // Remove or adjust if you need real-time data.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      data,
      usingMock: USE_MOCK,
      fetchedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[/api/pipelines] Error fetching pipeline statuses:', err);

    return res.status(500).json({
      error: 'Failed to fetch pipeline statuses',
      // Only expose detail in development — never leak error internals in production
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}
