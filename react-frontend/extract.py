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


def handle_import_line_local_component(line, import_statements):
    local_import_filename = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip().split("/")[-1]
    local_component_name = line.split(" ")[1]
    
    print(local_component_name, local_import_filename)
    
    if ("{" in line):
        print(line)
    
    import_component(local_component_name, import_statements)


def handle_import_line_svg(line, svg_dict):
    # Extract the SVG name from the import statement
    svg_name = line.split(" ")[1]
    svg_path = line.split(" from ")
    svg_path = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip().split("/")[-1]
    svg_dict[svg_name] = svg_path
    
    
def import_component(component_name, import_statements):
    # For easy access
    component_dict = import_statements["component_dict"]
    module_dict = import_statements["module_dict"]
    svg_dict = import_statements["svg_dict"]
    
    component_dict[component_name] = ""
    
    # Open the component file
    with open(f"./src/components/{component_name}.js", "r") as file:
        # Read the file line by line
        for line in file:
            if ("import " in line and " from " in line and ".svg" in line):
                handle_import_line_svg(line, svg_dict)
               
            elif ("import " in line and " from " in line and ".js" in line and "require" in line):
                print("require statement")
                
            elif ("import " in line and " from " in line and ".js" in line):
                handle_import_line_local_component(line, import_statements)
                
            elif ("import " in line and " from " in line):
                handle_import_line_module(line, module_dict)
                
            else:
                component_dict[component_name] += line

    

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
    
    import_statements = {
        "module_dict": {},
        "component_dict": {},
        "svg_dict": {}
    }
    
    with open("./extraction_output.js", "w") as output_file:
        for component in args.component:
            import_component(component, import_statements)
        
        # Write the module requirements to the output file
        for module in import_statements["module_dict"].keys():
            output_file.write(f"import {{ {', '.join(import_statements['module_dict'][module])} }} from {module};\n")
        
        # Keep each section separated by a newline
        output_file.write("\n")
        
        # Write the SVG imports to the output file
        for svg_name in import_statements["svg_dict"].keys():
            output_file.write(f"const {svg_name} = ")
            write_svg_to_file(output_file, import_statements["svg_dict"][svg_name])
            
        # Write each component to the output file
        # TODO: Implement this
        for component in import_statements["component_dict"].keys():
            output_file.write(import_statements["component_dict"][component])
    
    
    
    

            
            
        
    
if __name__ == "__main__":
    main()