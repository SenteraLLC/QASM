import json
import argparse
import subprocess
import shutil
import os
import bs4
import boto3

ENV_KEY = "REACT_APP_QASM_MODE"
REQUIRED_QASM_KEYS = ["app", "components"]
REQUIRED_S3_KEYS = ["bucket"]
REQUIRED_PUSH_KEYS = ["static_site_bucket"]
QASM_COMPONENTS = ["home", "grid", "multiclassgrid", "binaryeditor", "imagelabeler"]
QASM_MODES = ["local", "s3"]
RUN_MODES = ["dev", "build-exe", "push"]
APP_NAME_KEY = "name"
PACKAGE_JSON_PATH = "./package.json"
DEFAULT_INDEX_PATH = "./public/default-index.html"
INDEX_PATH = "./public/index.html"
CONFIG_DEST_PATH = "./config.json"
DEFAULT_CONFIG_PATH = "./default-config.json"

def main():
    """Start QASM app using a custom or default configuration."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=None, help="Stringified config json.")
    parser.add_argument("--mode", default="dev", help="Production environment.")
    parser.add_argument("--config_path", default=None, help="Path to config json.")
    args = parser.parse_args()
   
    # Parse configuration
    try: 
        # Load from json string
        if args.config is not None:
            config = json.loads(args.config)
        
        # Load from path to json file
        else:
            # When no config path is provided, use (1) the existing config.json if it exists, or (2) the default config
            if args.config_path is None: 
                if os.path.isfile(CONFIG_DEST_PATH):
                    args.config_path = CONFIG_DEST_PATH
                    print(f"Using existing config {CONFIG_DEST_PATH}")
                else:
                    args.config_path = DEFAULT_CONFIG_PATH
                    print(f"No config path provided, using default config {DEFAULT_CONFIG_PATH}")
            with open(args.config_path, "r") as f:
                config = json.load(f)
        
        # Save to the config path that the app will use
        with open(CONFIG_DEST_PATH, "w") as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        print(f"Error loading configuration json, aborting...")
        print(e)
        return

    if args.mode not in RUN_MODES:
        raise ValueError(f"Enter a valid run mode: {RUN_MODES}")
    
    if args.mode == "push" and any(key not in config for key in REQUIRED_PUSH_KEYS):
        raise ValueError(f"Missing required key(s) for push: {REQUIRED_PUSH_KEYS}")

    if any(key not in config for key in REQUIRED_QASM_KEYS): # If missing a required key
        raise ValueError(f"Missing required key(s) in config: {REQUIRED_QASM_KEYS}")

    # Check if any component is unrecognized
    will_break = False
    for component in config["components"]:
        component_name = component["component"]
        if component_name not in QASM_COMPONENTS:
            print(f"{component_name} is an unrecognized component. Use only the following: {QASM_COMPONENTS}")
            will_break = True
    if will_break:
        return

    # Use custom app name
    if APP_NAME_KEY in config:
        name = config[APP_NAME_KEY]
        # Edit package json build name
        with open(PACKAGE_JSON_PATH, "r+") as f:
            package_json = json.load(f)
            package_json["name"] = name.lower().replace(" ", "-") # Lowercase, no whitespace for package name
            package_json["build"]["productName"] = name # Windows application name
            f.seek(0)
            json.dump(package_json, f, indent=2)
            f.truncate()

        # Create index.html
        shutil.copyfile(DEFAULT_INDEX_PATH, INDEX_PATH)
        with open(INDEX_PATH, "r+") as f:
            txt = f.read()
            soup = bs4.BeautifulSoup(txt, "html.parser")
            soup.title.string = name # Name displayed in app header
            f.seek(0)
            f.write(str(soup))
            f.truncate()
    
    app = config["app"]
    if (app in QASM_MODES):
        if (app == "s3" and any(key not in config for key in REQUIRED_S3_KEYS)):
            raise ValueError(f"Missing required key(s) for {app} app: {REQUIRED_S3_KEYS}")
            
        print(f"Setup successful, starting {app} app in {args.mode} mode...")
        if args.mode == "push":
            # Setup static site bucket
            bucket_url = setup_static_site_bucket(bucket_name=config["static_site_bucket"])
            if bucket_url is None:
                return
            # Pass npm arg. On Windows, the value of `--bucket` is accessed in the npm script as %npm_config_bucket%
            subprocess.run(f"npm run {args.mode} --bucket={config['static_site_bucket']} --bucket_url={bucket_url}", shell=True)
        else:
            subprocess.run(f"npm run {args.mode}", shell=True)
    else:
        raise NotImplementedError(f"{app} runtime not yet implemented. Use: {QASM_MODES}")


def setup_static_site_bucket(bucket_name: str) -> str:
    """Create/setup S3 bucket for static site hosting and returns the url."""
    # Create bucket if it doesn't exist
    confirm = input(f"\n\nPROMPT: Will attempt to create/setup a public S3 bucket '{bucket_name}' for static site hosting, do you want to continue? (y/n): ")
    if confirm.lower() not in ["y", "yes"]:
        print("Static site bucket setup aborted by user.")
        return None

    s3_client = boto3.client('s3')
    try:
        s3_client.create_bucket(Bucket=bucket_name)
        print(f"Successfully created bucket {bucket_name}...")
    except Exception as e:
        print(e)
        print(f"Bucket {bucket_name} creation failed, skipping creation...")

    # Set public access block
    # Temporarily disable public access block to allow bucket policy to be set
    s3_client.put_public_access_block(
        Bucket=bucket_name,
        PublicAccessBlockConfiguration={
            'BlockPublicAcls': True,
            'IgnorePublicAcls': True,
            'BlockPublicPolicy': False,
            'RestrictPublicBuckets': False,
        },
    )
    
    # Create and attach bucket policy
    bucket_policy = json.dumps({
        'Version': '2012-10-17',
        'Statement': [{
            'Sid': 'AddPerm',
            'Effect': 'Allow',
            'Principal': '*',
            'Action': ['s3:GetObject'],
            'Resource': f"arn:aws:s3:::{bucket_name}/*" 
        }]
    })
    s3_client.put_bucket_policy(Bucket=bucket_name, Policy=bucket_policy)

    # Set public access block
    # Now that we've attached our bucket policy, we can enable public access block
    s3_client.put_public_access_block(
        Bucket=bucket_name,
        PublicAccessBlockConfiguration={
            'BlockPublicAcls': True,
            'IgnorePublicAcls': True,
            'BlockPublicPolicy': True,
            'RestrictPublicBuckets': False, # Keep this false to allow public access to bucket contents
        },
    )

    # Enable static website hosting
    s3_client.put_bucket_website(
        Bucket=bucket_name,
        WebsiteConfiguration={
            'ErrorDocument': {'Key': 'index.html'},
            'IndexDocument': {'Suffix': 'index.html'},
        }
    )

    # If region is None, it's us-east-1
    region = s3_client.get_bucket_location(Bucket=bucket_name)["LocationConstraint"]
    # Get bucket url, e.g. http://my-bucket.s3-website-us-east-1.amazonaws.com
    bucket_url = f"http://{bucket_name}.s3-website-{region if region else 'us-east-1'}.amazonaws.com"
    return bucket_url

if __name__ == "__main__":
    main()