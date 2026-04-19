resource "azurerm_resource_group" "main" {
  name     = "rg-pipeline-dashboard"
  location = "uksouth"
}

resource "azurerm_service_plan" "main" {
  name                = "asp-linux"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku
}

resource "azurerm_linux_web_app" "main" {
  name                          = "deployment-dashboard"
  resource_group_name           = azurerm_resource_group.main.name
  location                      = azurerm_service_plan.main.location
  service_plan_id               = azurerm_service_plan.main.id
  public_network_access_enabled = var.public_network_access_enabled

  site_config {
    application_stack {
      node_version = "22-lts"
    }
  }

  app_settings = {
    AZURE_STORAGE_ACCOUNT = azurerm_storage_account.main.name
    AZURE_TABLE_NAME      = azurerm_storage_table.deployment_status.name
  }

  identity {
    type = "SystemAssigned"
  }
}

# storage account
resource "azurerm_storage_account" "main" {
  name                          = "sa${random_string.storage_account_name.result}"
  resource_group_name           = azurerm_resource_group.main.name
  location                      = azurerm_resource_group.main.location
  account_tier                  = "Standard"
  account_replication_type      = "LRS"
  account_kind                  = "StorageV2"
  public_network_access_enabled = var.public_network_access_enabled
}

# storage table
resource "azurerm_storage_table" "deployment_status" {
  name                 = "deployment-status"
  storage_account_name = azurerm_storage_account.main.name
}

# rbac for storage account 
resource "azurerm_role_assignment" "app_table_reader" {
  role_definition_name = "Storage Table Data Reader"
  principal_id         = azurerm_linux_web_app.main.identity[0].principal_id
  scope                = azurerm_storage_account.main.main
}

resource "random_string" "storage_account_name" {
  length  = 8
  special = false
  upper   = false
  numeric = false
}