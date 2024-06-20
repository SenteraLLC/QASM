import json

from utils.lambda_utils import invoke_lambda_from_arn

def trigger_input_lambda(event, context):
    """Trigger a lambda using an arn and role."""
    body: dict = json.loads(event["body"])
    print(body)

    # Get the arn and role from the body
    function_arn = body.get("function_arn")
    role_arn = body.get("role_arn")
    params = body.get("params", {})

    # Invoke the lambda
    invoke_lambda_from_arn(
        function_arn=function_arn, 
        role_arn=role_arn, 
        params=params, 
        run_async=True
    )


def input_demo(event, context):
    """Do nothing."""
    print(event)
    inputs: list[dict] = event
    for input in inputs:
        print(input)