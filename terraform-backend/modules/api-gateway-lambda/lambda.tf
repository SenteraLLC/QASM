# Lambda function
resource "aws_lambda_function" "lambda_function" {
    function_name = local.lambda_name
    
    s3_bucket = var.s3_data.bucket
    s3_key = var.s3_data.key

    runtime = var.runtime 
    handler = var.handler

    source_code_hash = var.s3_data.source_code_hash 
    environment {
        variables = var.env_variables
    }
    
    role = var.role 
    timeout = var.timeout
}