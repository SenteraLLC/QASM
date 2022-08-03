output "ecs_lambda_api_gateway_url" {
	description = "Base URL for API Gateway stage."

	value = aws_apigatewayv2_stage.lambda_api_stage.invoke_url
}

locals {
	env_suffix = terraform.workspace == "prod" ? "production" : "development"
}

resource "local_file" "dev_url" {
	content = "REACT_APP_API_URL=${aws_apigatewayv2_stage.lambda_api_stage.invoke_url}/"
	
	filename = "../react-frontend/.env.${local.env_suffix}"
}