import json

from utils.lambda_utils import get_return_block_with_cors, invoke_lambda_from_arn

def trigger_input_lambda(event, context):
    """Trigger a lambda using an arn and role."""
    body: dict = json.loads(event["body"])
    print(body)

    # Get the arn and role from the body
    function_arn = body.get("function_arn")
    role_arn = body.get("role_arn")
    params = body.get("params", {})

    # Invoke the lambda
    response = invoke_lambda_from_arn(
        function_arn=function_arn, 
        role_arn=role_arn, 
        params=params, 
        run_async=False
    )
    print(response)
    return get_return_block_with_cors(response)


def input_demo(event, context):
    """Do nothing."""
    print(event)