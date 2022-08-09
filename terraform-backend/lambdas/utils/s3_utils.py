import os
import boto3
from pathlib import Path
from botocore.client import Config

client = boto3.client("s3")

def get_all_subfolder_keys(bucket, subfolder_path):
    """Get a list of all keys in an S3 subfolder."""
    result = client.list_objects(Bucket=bucket, Prefix=subfolder_path, Delimiter="/")
    print(result)
    keys = [
        os.path.basename(os.path.normpath(o.get("Prefix")))
        for o in result.get("CommonPrefixes")
    ]
    print(keys)

    return keys

def get_signed_url(bucket_name, folder_path, image_name, s3_client=None):
    """Get a signed url for an image in an S3 subfolder."""
    if s3_client is None:
        s3_client = boto3.client("s3", config=Config(signature_version="s3v4"))
    path_key = Path(folder_path) / image_name
    print(path_key)
    s3_params = {
        "Bucket": bucket_name,
        "Key": str(path_key),
    }
    return s3_client.generate_presigned_url(
        "get_object",
        Params=s3_params,
        ExpiresIn=86400,
    )


def get_all_signed_urls_in_folder(bucket_name, folder_path, s3_client=None):
    """Get a dict of all signed urls in an S3 subfolder."""
    if s3_client is None:
        s3_client = boto3.client("s3", config=Config(signature_version="s3v4"))
    if not folder_path.endswith("/"):
        folder_path += "/"
    result = client.list_objects(Bucket=bucket_name, Prefix=folder_path, Delimiter="/")
    return {
        str(Path(str(o.get("Key")).split("/")[-1]).with_suffix("")): # Filename w/o ext
        get_signed_url(
            bucket_name, folder_path, str(o.get("Key")).split("/")[-1], s3_client
        )
        for o in result.get("Contents")
    }