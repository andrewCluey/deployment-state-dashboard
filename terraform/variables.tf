

variable "public_network_access_enabled" {
  type        = string
  description = "Should the Storage Account and web app be available from the Internet? Private endpoints, service endpoints and App Service environmentd may be required to keep it private."
  default     = "true"
}

variable "app_service_plan_sku" {
  type = string
  default = "F1"
  description = "value"
}