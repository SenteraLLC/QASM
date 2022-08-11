# Variables 
variable "base_name" {
    description = "Name for the API Gateway. Separate with dashes. This will populate the route as well."
    type = string
}

variable "handler" {
    description = "Lambda handler function name."
    type = string
}

variable "role" {
    description = "Lambda execution role."
    type = string
}

variable "runtime" {
    description = "Runtime for the lambda function."
    default = "python3.8"
    type = string
}

variable "env_variables" { 
    description = "Environment variables for the lambda function."
    default = {"git" = "gud"}
    type = map(string)
}

variable "s3_data" {
    description = "S3 data for the lambda code."
    type = object({
        bucket = string
        key = string
        source_code_hash = string
    })
}
variable "api_gateway" {
    description = "API gateway to tack lambdas to."
    type = object({
        id = string
        execution_arn = string
    })
}

variable "timeout" {
    description = "Timeout for the lambda function."
    default = 60
    type = number
}

# variable "api_gateway_data" {
#     description = "Data for the API Gateway."
#     type = object({
#         api = aws_apigatewayv2_api
#         destination_arn = string
#     })
# }

locals {
    lambda_name = "qasm-${terraform.workspace}-${var.base_name}"
    api_route = "POST /${replace(var.base_name, "-", "_")}"
}