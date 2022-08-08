from multiprocessing.connection import Client
import boto3
import json
from utils.lambda_utils import get_return_block_with_cors
from utils.s3_utils import get_all_signed_urls_in_folder

def open_dir(event, context):
    """Get info to construct a custom s3 browser."""
    body = json.loads(event["body"])
    bucket_name = body["bucket"]
    prefix = body["prefix"]
    s3 = boto3.client("s3")
    print(prefix)
    if prefix is None:
        response = s3.list_objects_v2(Bucket=bucket_name, Delimiter="/")
        if 'Contents' in response:
            files = [obj['Key'] for obj in response['Contents']]
        else:
            files = []

        if 'CommonPrefixes' in response:
            folders = [fld["Prefix"] for fld in response["CommonPrefixes"]]
        else:
            folders = []
    else:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter="/")
        if 'Contents' in response:
            files = [obj['Key'] for obj in response['Contents'] if obj['Key'] != prefix]
        else:
            files = []
            
        if 'CommonPrefixes' in response:
            folders = [fld["Prefix"] for fld in response["CommonPrefixes"]]
        else:
            folders = []
    ret = {
        "files": files,
        "folders": folders
    }
    return get_return_block_with_cors(ret)

def get_signed_urls_in_folder(event, context):
    """Get all signed urls in a folder."""
    body = json.loads(event["body"])
    bucket_name = body["bucket_name"]
    folder_name = body["folder_name"]
    urls = get_all_signed_urls_in_folder(bucket_name, folder_name)
    return get_return_block_with_cors({"urls": urls})