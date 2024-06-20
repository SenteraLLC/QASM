"""Lambda utils."""
import boto3
import json
from decimal import Decimal


class LambdaJSONEncoder(json.JSONEncoder):
    """DynamoDB encoder to handle decimal cases."""

    def default(self, o):
        """Convert to float."""
        if isinstance(o, Decimal):
            return float(o)
        return super(LambdaJSONEncoder, self).default(o)


def get_return_block_with_cors(body, needs_encoding=True):
    """Get return block with cors."""
    # TODO just auto-detect needs_encoding
    if needs_encoding:
        body = json.dumps(body, cls=LambdaJSONEncoder)
    return {
        "statusCode": 200,
        "body": body,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET",
            "Content-Type": "application/json",
        },
    }

def invoke_lambda_from_arn(
    function_arn: str = None, role_arn: str = None, params: dict = None, run_async: bool = False
) -> dict:
    """Invoke a lambda and return the response, unless running async."""
    if function_arn is None:
        raise ValueError("Lambda invokation: arn must be provided.")
    if role_arn is None:
        raise ValueError("Lambda invokation: role must be provided.")
    if params is None:
        params = {}
    print(f"Invoking lambda {function_arn} with role {role_arn} and params {params}")
    
    # TODO: Add support for assuming a role, and cross-account invokation
    # Assume the role
    # sts = boto3.client("sts")
    # assumed_role = sts.assume_role(
    #     RoleArn=role_arn, RoleSessionName="AssumeRoleSession"
    # )
    # credentials = assumed_role["Credentials"]

    function_region = function_arn.split(":")[3]
    client = boto3.client(
        "lambda",
        region_name=function_region,
        # aws_access_key_id=credentials["AccessKeyId"],
        # aws_secret_access_key=credentials["SecretAccessKey"],
        # aws_session_token=credentials["SessionToken"],    
    )

    # Invoke the lambda
    if run_async:
        client.invoke(
            FunctionName=function_arn,
            InvocationType="Event",
            Payload=json.dumps(params, cls=LambdaJSONEncoder),
        )
    else:
        return json.loads(
            client.invoke(
                FunctionName=function_arn,
                InvocationType="RequestResponse",
                Payload=json.dumps(params, cls=LambdaJSONEncoder),
            )["Payload"].read()
        )