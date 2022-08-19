from multiprocessing.connection import Client
import boto3
import json
import os
from utils.lambda_utils import get_return_block_with_cors
from utils.s3_utils import get_all_signed_urls_in_folder, get_signed_url

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

def load_image(event, context):
    """get a single signed url."""
    body = json.loads(event["body"])
    bucket_name = body["bucket_name"]
    file_name = body["file_name"]
    folder_path, image_name = os.path.split(file_name)
    url = get_signed_url(bucket_name, folder_path, image_name, s3_client=None)
    return get_return_block_with_cors({"url": url})
    


def save_labels(event, context):
    """Save json data to s3 path."""
    body = json.loads(event["body"])
    labels = body["labels"]
    bucket_name = body["bucket_name"]
    file_name = body["file_name"]
    try:
        s3 = boto3.resource('s3')
        s3object = s3.Object(bucket_name, file_name)
        s3object.put(
            Body=(bytes(json.dumps(labels).encode('UTF-8')))
        )
        return get_return_block_with_cors("Labels saved.", False)
    except Exception:
        return get_return_block_with_cors("Error saving labels.", False)


def load_labels(event, context):
    """Load json data from an s3 path."""
    body = json.loads(event["body"])
    bucket_name = body["bucket_name"]
    file_name = body["file_name"]
    
    s3 = boto3.resource('s3')
    content_object = s3.Object(bucket_name, file_name)
    file_content = content_object.get()['Body'].read().decode('utf-8')
    labels = json.loads(file_content)
    return get_return_block_with_cors({"labels": labels})
