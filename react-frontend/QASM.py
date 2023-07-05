import json
import argparse
import subprocess
import shutil
import os
import bs4

ENV_KEY = "REACT_APP_QASM_MODE"
REQUIRED_QASM_KEYS = ["app", "components"]
REQUIRED_S3_KEYS = ["bucket"]
QASM_COMPONENTS = ["home", "grid", "multiclassgrid", "binaryeditor", "imagelabeler"]
QASM_MODES = ["local", "s3"]
RUN_MODES = ["dev", "build-exe"]
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
        print(f"Enter a valid run mode: {RUN_MODES}")
        return

    if any(key not in config for key in REQUIRED_QASM_KEYS): # If missing a required key
        print(f"Missing one or more required keys in config: {REQUIRED_QASM_KEYS}")
        return

    # Check if any component is unrecognized
    will_break = False
    for component in config["components"]:
        if component["component"] not in QASM_COMPONENTS:
            print("{} is an unrecognized component. Use only the following: {}".format(component["component"], QASM_COMPONENTS))
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
            print(f"Missing one or more required keys for {app} app: {REQUIRED_S3_KEYS}")
            return
            
        print(f"Setup successful, starting {app} app in {args.mode} mode...")
        subprocess.run(f"npm run {args.mode}", shell=True)
    else:
        print(f"{app} runtime not yet implemented. Use: {QASM_MODES}")
        raise NotImplementedError

if __name__ == "__main__":
    main()