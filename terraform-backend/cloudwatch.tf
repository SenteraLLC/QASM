resource "aws_cloudwatch_log_group" "lambda" {
    name = "qasm-${terraform.workspace}-lambda-log-group"
    retention_in_days = 7
}


resource "aws_cloudwatch_log_group" "api_gateway" {
    name = "qasm-${terraform.workspace}-api-gateway-log-group"
    retention_in_days = 7
}


resource "aws_cloudwatch_log_group" "ecs_api" {
    name = "qasm-${terraform.workspace}-ecs-api-log-group"
    retention_in_days = 7
}