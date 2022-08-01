import json
import argparse

def main():
    """Start QASM app based off config.json."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=None, help="Stringified config json.")
    parser.add_argument("--config_path", default="./config.json", help="Path to config json.")
    args = parser.parse_args()
    print(args)

    if args.config is None:
        try: # Load from path
            config = json.loads(open(args.config_path, "r").read())
        except Exception as e:
            print(f"Error loading {args.config_path}, aborting...")
            print(e)
            return
    else:
        try: # Load from json string
            config = json.loads(args.config)
        except Exception as e:
            print("Error loading config json, aborting...")
            print(e)
            return

    print(config)

if __name__ == "__main__":
    main()