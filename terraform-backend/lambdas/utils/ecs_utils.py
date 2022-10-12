"""Utils for ECS lambdas."""
import json
import os

import boto3
from utils.lambda_utils import get_return_block_with_cors

ParamAppenders = {
    "operations": {
        "name": "OPERATIONS",
        "value": None,
    },
    "src_dir": {
        "name": "SRC_DIR",
        "value": None,
    },
    "dest_dir": {
        "name": "DEST_DIR",
        "value": None,
    },
}


def ecs_lambda_handler_block(event, task_str):
    """Block for all ECS lambdas."""
    print(event)

    task_params = get_ecs_cluster_task_params()
    print(task_params)

    # Append necessary components
    body = json.loads(event["body"])
    for key in body.keys():
        if key in ParamAppenders.keys():
            appender = ParamAppenders[key]
            appender["value"] = body[key]
            task_params["overrides"]["containerOverrides"][0]["environment"].append(
                appender
            )

    ecs_client = boto3.client("ecs")
    response = ecs_client.run_task(**task_params)
    print(response)

    return get_return_block_with_cors(
        body=f"QASM {task_str} TASK STARTED", needs_encoding=False
    )


def get_ecs_cluster_task_params():
    """Get qasm ecs cluster task params."""
    return {
        "taskDefinition": f"{os.environ['task_def_id']}:{os.environ['task_revision']}",
        "launchType": "FARGATE",
        "cluster": os.environ["ecs_cluster_name"],
        "platformVersion": "LATEST",
        "count": 1,
        "networkConfiguration": {
            "awsvpcConfiguration": {
                "subnets": [
                    "subnet-04bf951166490b3cc",
                    "subnet-0c7d337f7975ec37f",
                ],
                "assignPublicIp": "ENABLED",
                "securityGroups": ["sg-05a4a1dda783f3dec"],
            }
        },
        "overrides": {
            "containerOverrides": [
                {
                    "name": os.environ["task_name"],
                }
            ]
        },
    }
