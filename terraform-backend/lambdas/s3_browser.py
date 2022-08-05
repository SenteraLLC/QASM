from multiprocessing.connection import Client
import boto3
from utils.lambda_utils import get_return_block_with_cors

def open_dir(event, context):
    """Get info to construct a custom s3 browser."""
    print(event["body"])
    bucket = event["body"]
    client = boto3.client("s3")
    ret = list(client.list_objects(Bucket=bucket)['Contents'])
    # return get_return_block_with_cors("Endpoint functional", False)
    return get_return_block_with_cors(ret)