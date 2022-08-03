output "ecs_lambda_api_gateway_url" {
	description = "Base URL for API Gateway stage."

	value = aws_apigatewayv2_stage.lambda_api_stage.invoke_url
}
