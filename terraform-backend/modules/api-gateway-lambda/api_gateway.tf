# API gateway resources for module.
resource "aws_apigatewayv2_integration" "integration" {
    api_id = var.api_gateway.id

    integration_uri = aws_lambda_function.lambda_function.invoke_arn
    integration_type = "AWS_PROXY"
    integration_method = "POST"
}

resource "aws_apigatewayv2_route" "route" {
    api_id = var.api_gateway.id
    
    route_key = local.api_route
    target = "integrations/${aws_apigatewayv2_integration.integration.id}"
}

resource "aws_lambda_permission" "permission" {
    statement_id = "AllowExectuionFromAPIGateway"
    action = "lambda:InvokeFunction"
    function_name = local.lambda_name
    principal = "apigateway.amazonaws.com"

    source_arn = "${var.api_gateway.execution_arn}/*/*"
}


