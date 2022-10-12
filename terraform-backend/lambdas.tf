locals {
    lambda_defs = [
        # Normal lambdas
        { 
            base_name = "open-dir"
            handler = "s3_browser.open_dir"
        },
        { 
            base_name = "get-signed-urls-in-folder"
            handler = "s3_browser.get_signed_urls_in_folder"
        },
        { 
            base_name = "save-labels"
            handler = "s3_browser.save_labels"
        },
        { 
            base_name = "load-labels"
            handler = "s3_browser.load_labels"
        },
        {
            base_name = "load-image"
            handler = "s3_browser.load_image"
        },
        {
            base_name = "save-image"
            handler = "s3_browser.save_image"
        },
        {
            base_name = "create-binary-directory"
            handler = "s3_browser.create_binary_directory"
        },

        # ECS Lambdas
        {
            base_name = "ecs-binary-directory"
            handler = "ecs_procs.ecs_binary_directory"
            env_variables = module.ecs_tasks["binary-directory"]
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
    env_variables = try(each.value.env_variables, {"git"="gud"})
    timeout = try(each.value.timeout, 60)

    role = aws_iam_role.qasm_lambda_exec_role.arn 
    s3_data = {
        bucket = aws_s3_bucket.lambda_s3_bucket.id
        key = aws_s3_object.lambda_zip.key 
        source_code_hash = data.archive_file.lambda_zip.output_base64sha256
    }
    api_gateway = aws_apigatewayv2_api.lambda_api
}