import os
import boto3

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