import json
import argparse
import subprocess
import bs4

ENV_KEY = "REACT_APP_QASM_MODE"
REQUIRED_QASM_KEYS = ["app", "components"]
REQUIRED_S3_KEYS = ["bucket"]
QASM_COMPONENTS = ["home", "grid", "binaryeditor"]
QASM_MODES = ["local", "s3"]
RUN_MODES = ["dev", "build-exe"]
APP_NAME_KEY = "name"
PACKAGE_JSON_PATH = "./package.json"
INDEX_PATH = "./public/index.html"

def main():
    """Start QASM app based off config.json."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=None, help="Stringified config json.")
    parser.add_argument("--mode", default="dev", help="Production environment.")
    parser.add_argument("--config_path", default="./config.json", help="Path to config json.")
    args = parser.parse_args()

    if args.config is None:
        try: # Load from path
            config = json.loads(open(args.config_path, "r").read())
        except Exception as e:
            print(f"Error loading {args.config_path}, aborting...")
            print(e)
            return
    else: # TODO: this format is currently not supported in the react app
        try: # Load from json string
            config = json.loads(args.config)
        except Exception as e:
            print("Error loading config json, aborting...")
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

        # Edit index.html
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