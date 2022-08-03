locals {
    lambda_defs = [
        { 
            base_name = "lambda-test"
            handler = "test.test"
        },
    ]
}

module "api-lambdas" {
    source = "./modules/api-gateway-lambda"

    for_each = {
        for index, lambda_def in local.lambda_defs:
        lambda_def.base_name => lambda_def
    }
    base_name = each.value.base_name 
    handler = each.value.handler
    timeout = try(each.value.timeout, 60)

    role = aws_iam_role.qasm_lambda_exec_role.arn 
    s3_data = {
        bucket = aws_s3_bucket.lambda_s3_bucket.id
        key = aws_s3_object.lambda_zip.key 
        source_code_hash = data.archive_file.lambda_zip.output_base64sha256
    }
    api_gateway = aws_apigatewayv2_api.lambda_api
}