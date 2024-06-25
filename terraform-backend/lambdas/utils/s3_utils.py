import os
import boto3
from pathlib import Path
from botocore.client import Config

client = boto3.client("s3")

def get_all_subfolder_keys(bucket, subfolder_path):
    """Get a list of all keys in an S3 subfolder, excluding the subfolder itself."""
    if not subfolder_path.endswith("/"):
        subfolder_path += "/"
    result = client.list_objects(Bucket=bucket, Prefix=subfolder_path, Delimiter="/")
    print(result)
    if result.get("Contents"):
        return [o.get("Key") for o in result.get("Contents") if str(o.get("Key")) != subfolder_path]
    else:
        print(f"No contents found in {subfolder_path}.")
        return []
    
    
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
    
    # use pagination to support > 1000 objects
    paginator = s3_client.get_paginator('list_objects')
    operation_parameters = {'Bucket': bucket_name, 'Prefix': folder_path, 'Delimiter': "/"}
    page_iterator = paginator.paginate(**operation_parameters)

    signed_urls = {}
    for page in page_iterator:
        if page.get("Contents"):
            for o in page.get("Contents"):
                if str(o.get("Key")) != folder_path:
                    signed_urls[str(Path(str(o.get("Key")).split("/")[-1]).with_suffix(""))] = get_signed_url(
                        bucket_name, folder_path, str(o.get("Key")).split("/")[-1], s3_client
                    )
    if not signed_urls:
        print(f"No contents found in {folder_path}.")
    return signed_urls

if __name__ == "__main__":
    res = get_all_signed_urls_in_folder("sentera-rogues-data", "Farmer City 2022/Strip Trial/Planting 1/Videos/6-21/Row 1b, 6a/3840x2160@120fps/Pass A/DS Splits/DS 002/oblique Raw Images/")
    print(len(res))