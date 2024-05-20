import argparse

def handle_import_line_module(line, modules_dict):
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


def handle_import_line_local_component(line, import_info):
    pass


def handle_import_line_svg(line, svg_dict):
    # Extract the SVG name from the import statement
    svg_name = line.split(" ")[1]
    svg_path = line.split(" from ")
    svg_path = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip().split("/")[-1]
    svg_dict[svg_name] = svg_path
    
    
def import_component(component_name, import_info):
    # For easy access
    component_dict = import_info["component_dict"]
    module_dict = import_info["module_dict"]
    svg_dict = import_info["svg_dict"]
    
    # Open the component file
    with open(f"./src/components/{component_name}.js", "r") as file:
        # Read the file line by line
        for line in file:
            if ("import " in line and " from " in line and ".svg" in line):
                handle_import_line_svg(line, svg_dict)
                
            elif ("import " in line and " from " in line and ".js" in line):
                handle_import_line_local_component(line, import_info)
                
            elif ("import " in line and " from " in line):
                handle_import_line_module(line, module_dict)

    

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
    
    
    import_info = {
        "module_dict": {},
        "svg_dict": {},
        "component_dict": {}
    }
    
    print(type(import_info))
    
    
    with open("./extraction_output.js", "w") as output_file:
        for component in args.component:
            import_component(component, import_info)
        
        print("module_dict", import_info["module_dict"])
        # module
        # Write the module requirements to the output file
        for module in import_info["module_dict"].keys():
            output_file.write(f"import {{ {', '.join(import_info['module_dict'][module])} }} from {module};\n")
        
        # Keep each section separated by a newline
        output_file.write("\n")
        
        # Write the component imports to the output file
        # TODO: Implement this
        
        # Write the SVG imports to the output file
        for svg_name in import_info["svg_dict"].keys():
            output_file.write(f"const {svg_name} = ")
            write_svg_to_file(output_file, import_info["svg_dict"][svg_name])
    
    
    
    

            
            
        
    
if __name__ == "__main__":
    main()