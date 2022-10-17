import argparse
import sys
from pathlib import Path
import boto3
from typing import Tuple
import cv2
import numpy as np

DEFAULT_DEST_PREFIX = "modified"
KERNEL_SIZE = 3
KERNEL = cv2.getStructuringElement(cv2.MORPH_RECT, (KERNEL_SIZE, KERNEL_SIZE))

client = boto3.client("s3")
s3 = boto3.resource("s3")


def main():
    """Parse args and start binary generation."""
    print(sys.argv)
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket_name", default=None)
    parser.add_argument("--src_dir", default=None)
    parser.add_argument("--operations", default=None)
    parser.add_argument("--dest_dir", default=None)
    args = parser.parse_args()
    print(args)

    generate_binaries(
        args.bucket_name,
        args.src_dir,
        args.operations,
        args.dest_dir,
    )



def generate_binaries(
    bucket_name: str = None, 
    src_dir: str = None, 
    operations: str = None, 
    dest_dir: str = None
):
    """Generate new binaries given a source directory and a set of operations."""
    if bucket_name in ["", None]:
        raise Exception("No S3 bucket name provided.")
    if src_dir in ["", None]:
        raise Exception("No source directory provided.")
    if operations in ["", None]:
        raise Exception("No operations provided.")
    if dest_dir in ["", None]:
        parts = list(Path(src_dir).parts)
        parts[-1] = f"{DEFAULT_DEST_PREFIX}_{parts[-1]}" # add prefix to folder name
        dest_dir = str(Path(*parts)).replace("\\", "/")
        print(f"Setting default destination path as '{dest_dir}'")

    # Remove trailing slashes
    src_dir = src_dir.rstrip("/")
    dest_dir = dest_dir.rstrip("/")

    # Note the base src folder so we don't loop over folders that are named similarily
    base_folder = Path(src_dir).parts[-1]

    bucket = s3.Bucket(bucket_name)
    for object_summary in bucket.objects.filter(Prefix=src_dir):
        cur_base_folder = Path(object_summary.key).parts[-2]
        try:
            if cur_base_folder == base_folder:
                # Get image name from path
                image_name, ext = get_name_and_ext_from_obj_summary(object_summary)
                print(f"image: {image_name}, ext: {ext}")

                # Get image
                img = object_summary.get().get("Body").read()
                img = cv2.imdecode(np.asarray(bytearray(img)), cv2.IMREAD_COLOR)

                create_and_save_binary(
                    bucket_name,
                    img,
                    image_name,
                    ext,
                    operations,
                    dest_dir,
                )
        except Exception as e:
            print(e)
            print(f"Failed to create binary for {object_summary.key}, skipping.")
            continue


def create_and_save_binary(
    bucket_name: str,
    img: np.ndarray,
    image_name: str,
    ext: str,
    operations: str,
    dest_dir: str,
):
    """Perform operations on an image and upload it to s3."""
    for operation in operations:
        if operation.lower() == 'e':
            img = cv2.erode(img, KERNEL)
        elif operation.lower() == 'd':
            img = cv2.dilate(img, KERNEL)

    # Convert to image_string and upload
    image_string = cv2.imencode(f".{ext}", img)[1].tobytes()
    save_key = f"{dest_dir}/{image_name}.{ext}"
    print(f"Saving thumbnail to {save_key}")
    client.put_object(
        Bucket=bucket_name,
        Key=save_key,
        Body=image_string,
    )


def get_name_and_ext_from_obj_summary(object_summary) -> Tuple[str, str]:
    """Get file name and extention from an s3 bucket object summary."""
    filename = Path(object_summary.key).name.rsplit(".", 1)
    return str(filename[0]), str(filename[1])  # name, ext


if __name__ == "__main__":
    main()
    # bucket_name = "stand-qa-data"
    # src_dir = "mfstand/2022/Mexico/GuillerminaOjos/052022T205734/binaries/exg/"
    # operations = "eeedd"
    # dest_dir = "mfstand/2022/Mexico/GuillerminaOjos/052022T205734/binaries/potatoes/"
    # generate_binaries(bucket_name, src_dir, operations, dest_dir)