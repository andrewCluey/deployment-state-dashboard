# Pipeline Status Dashboard

A Next.js single-page dashboard showing Azure DevOps deployment pipeline status
across all services and environments. Reads from Azure Table Storage server-side,
using Managed Identity in Azure and a Service Principal for local development.
No secrets ever reach the browser.

---

## Architecture

```
Browser (React UI)
    │
    │  GET /api/pipelines  (same origin — no CORS)
    ▼
Next.js server  ──► Azure Entra ID  (DefaultAzureCredential)
    │                    │
    │            bearer token
    │                    │
    └────────────────────►  Azure Table Storage
                              PipelineStatus table

Azure DevOps pipelines  ──►  Azure Table Storage  (write on each run)
```

In Azure App Service: Managed Identity is used automatically — no secrets.
In local dev: Service Principal credentials are used via .env.local.

---

## Quick start (local dev)

```bash
npm install
npm run dev
```

Opens at http://localhost:3000 with demo data.
No Azure connection needed to see the UI.

### Connect to Azure (local dev)

1. Copy `.env.example` to `.env.local`
2. Fill in your storage account name and table name
3. Add your Service Principal credentials (see "Local dev Service Principal" below)
4. Restart: `npm run dev`

---

## Azure Table Storage schema

| Column        | Type     | Description                                  |
|---------------|----------|----------------------------------------------|
| PartitionKey  | string   | Service name (e.g. `api-gateway`)            |
| RowKey        | string   | Environment: `dev` `qa` `sit` `uat` `preprod` `prod` |
| Status        | string   | `succeeded` `failed` `inprogress`            |
| Version       | string   | Last deployed version (e.g. `v2.0.0`)        |
| LastUpdated   | ISO 8601 | Timestamp of the pipeline run                |
| PipelineRunId | string   | Azure DevOps pipeline run ID                 |
| Commit        | string   | Git commit SHA                               |

---

## Azure setup (one-time)

### 1. Create the Storage Table

In the Azure Portal:
- Go to your Storage Account → Tables → + Table
- Name it `PipelineStatus` (or whatever you set in AZURE_TABLE_NAME)

### 2. Create the App Service

- Runtime: **Node.js 20 LTS**
- Can be deployed into your existing App Service Environment

### 3. Enable Managed Identity on the App Service

```
App Service → Identity → System assigned → Status: On → Save
```

### 4. Grant Storage Table Data Reader

```
Storage Account → Access control (IAM)
  → Add role assignment
  → Role: Storage Table Data Reader
  → Assign access to: Managed identity
  → Select your App Service → Save
```

### 5. Set App Service Configuration

```
App Service → Configuration → Application settings
```

Add:
| Name                          | Value           |
|-------------------------------|-----------------|
| AZURE_STORAGE_ACCOUNT         | mystorageaccount|
| AZURE_TABLE_NAME              | PipelineStatus  |
| WEBSITE_RUN_FROM_PACKAGE      | 1               |
| SCM_DO_BUILD_DURING_DEPLOYMENT| true            |

Do NOT add AZURE_TENANT_ID / CLIENT_ID / CLIENT_SECRET — Managed Identity handles it.

---

## Local dev Service Principal

For local development you need a Service Principal (app registration) because
Managed Identity only works on Azure-hosted compute.

### Create an App Registration

1. Azure Portal → Entra ID → App registrations → New registration
2. Name it something like `pipeline-dashboard-dev`
3. Note the **Application (client) ID** and **Directory (tenant) ID**
4. Certificates & secrets → New client secret → copy the value

### Grant it access

```
Storage Account → Access control (IAM)
  → Add role assignment
  → Role: Storage Table Data Reader
  → Assign access to: App, group or user
  → Select your App Registration → Save
```

### Add to .env.local

```
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_STORAGE_ACCOUNT=mystorageaccount
AZURE_TABLE_NAME=PipelineStatus
```

---

## Deployment (GitHub Actions)

### One-time setup

1. In Azure Portal: App Service → Overview → **Get publish profile** → download the file
2. In GitHub: Settings → Secrets → Actions → New secret:
   - `AZURE_APP_SERVICE_NAME` = your App Service name
   - `AZURE_PUBLISH_PROFILE` = paste the entire contents of the downloaded file

### Deploy

Push to `main` — the GitHub Actions workflow (`.github/workflows/deploy.yml`) handles the rest.

---

## Writing pipeline status from Azure DevOps

Add this step at the end of each pipeline (after success or failure):

```yaml
- task: AzureCLI@2
  displayName: Update pipeline status
  condition: always()
  inputs:
    azureSubscription: '<your-service-connection>'
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      STATUS="succeeded"
      if [ "$(Agent.JobStatus)" != "Succeeded" ]; then
        STATUS="failed"
      fi

      az storage entity merge \
        --account-name $(STORAGE_ACCOUNT) \
        --table-name PipelineStatus \
        --entity \
          PartitionKey=$(SERVICE_NAME) \
          RowKey=$(ENVIRONMENT) \
          Status=$STATUS \
          Version=$(BUILD_VERSION) \
          LastUpdated=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
          PipelineRunId=$(Build.BuildId) \
          Commit=$(Build.SourceVersion) \
        --auth-mode login
```

Where:
- `SERVICE_NAME` = the service name (matches PartitionKey / row in the dashboard)
- `ENVIRONMENT` = `dev`, `qa`, `sit`, `uat`, `preprod`, or `prod`
- `BUILD_VERSION` = however you version your builds (e.g. a git tag)
- `STORAGE_ACCOUNT` = your storage account name (set as a pipeline variable)

The `--auth-mode login` uses the Azure DevOps service connection identity — 
grant it **Storage Table Data Contributor** on the storage account so it can write.


## deploy by zip

npm install
npm run build
zip -r deploy.zip .next public package.json package-lock.json next.config.js