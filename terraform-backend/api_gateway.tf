# Common API Gateway Resources 
resource "aws_apigatewayv2_api" "lambda_api" {
    name = "qasm-${terraform.workspace}-lambda-api"
    protocol_type = "HTTP"
    cors_configuration {
        allow_origins = ["*"]
        allow_methods = ["OPTIONS", "PUT", "POST", "GET"]
        allow_headers = ["*"]
    }
}

resource "aws_apigatewayv2_stage" "lambda_api_stage" {
    api_id = aws_apigatewayv2_api.lambda_api.id

    name = "${aws_apigatewayv2_api.lambda_api.name}-stage"
    auto_deploy = true

    access_log_settings {
        destination_arn = aws_cloudwatch_log_group.api_gateway.arn 

        format = jsonencode({
            requestId               = "$context.requestId"
            sourceIp                = "$context.identity.sourceIp"
            requestTime             = "$context.requestTime"
            protocol                = "$context.protocol"
            httpMethod              = "$context.httpMethod"
            resourcePath            = "$context.resourcePath"
            routeKey                = "$context.routeKey"
            status                  = "$context.status"
            responseLength          = "$context.responseLength"
            integrationErrorMessage = "$context.integrationErrorMessage"
        })
    }
}

# Output url
output "invoke_url" {
	description = "Base URL for API Gateway stage."

	value = aws_apigatewayv2_stage.lambda_api_stage.invoke_url
}