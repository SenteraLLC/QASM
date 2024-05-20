import argparse

def handle_module_import(line, modules_dict):
    # Extract the module name from the import statement
    module = line.split(" from ")[1].split("'")[1]
    
    if (module not in modules_dict.keys()):
        modules_dict[module] = []
    
    words = line.split(" ")
    if (words[1] == "{"):
        index = 2
        while (words[index] != "}"):
            # Append the module name to the requirements list while removing the comma
            modules_dict[module].append(words[index].replace(",", ""))

            index += 1
    else:
        # Append the module name to the requirements list
        modules_dict[module] = modules_dict[module].append(words[1])


def handle_local_component_import(line):
    pass


def handle_svg_import(line, svg_dict):
    # Extract the SVG name from the import statement
    svg_name = line.split(" ")[1]
    svg_path = line.split(" from ")
    svg_path = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip().split("/")[-1]
    svg_dict[svg_name] = svg_path
    

def write_svg_to_file(output_file, svg_filename):
    print("svg_filename", svg_filename)
    with open(f"./src/icons/{svg_filename}", "r") as svg_file:
        for line in svg_file:
            if ("<?xml" in line):
                continue
            if ("<!--" in line or "-->" in line):
                continue
            output_file.write(line)
        


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--component", nargs="+", help="Name of component to extract.")
    args = parser.parse_args()

    if (args.component == None):
        print("No component name provided.")
        return
    
    modules_dict = {}
    svg_dict = {}
    
    
    with open("./extraction_output.js", "w") as output_file:
        
        for component in args.component:
            # Open the component file
            with open(f"./src/components/{component}.js", "r") as file:
                # Read the file line by line
                for line in file:
                    
                    if ("import " in line and " from " in line and ".svg" in line):
                        handle_svg_import(line, svg_dict)
                    elif ("import " in line and " from " in line and ".js" in line):
                        handle_local_component_import(line)
                    elif ("import " in line and " from " in line):
                        handle_module_import(line, modules_dict)
                        
                print(modules_dict)
        
        # Write the module requirements to the output file
        for module in modules_dict.keys():
            output_file.write(f"import {{ {', '.join(modules_dict[module])} }} from {module};\n")
        
        output_file.write("\n")
        
        # Write the component imports to the output file
        # TODO: Implement this
        
        # Write the SVG imports to the output file
        for svg_name in svg_dict.keys():
            output_file.write(f"const {svg_name} = ")
            write_svg_to_file(output_file, svg_dict[svg_name])
    
    
    
    

            
            
        
    
if __name__ == "__main__":
    main()