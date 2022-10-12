"""Lambda handlers for ECS processes."""
from utils.ecs_utils import ecs_lambda_handler_block


def ecs_binary_directory(event, context):
    """Exg segmentation ECS lambda handler."""
    return ecs_lambda_handler_block(event, "BINARY DIRECTORY")
