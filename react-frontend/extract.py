import argparse
import typing
from pprint import pprint
import os

def make_path(original_path: str) -> str:
    """Helper function to create an absolute path from a relative path.
    The relative path is assumed to be relative to the components directory."""
    
    script_root_dir = os.getcwd()
    components_dir = os.path.abspath(os.path.join(script_root_dir, "src/components"))
    return os.path.abspath(os.path.join(components_dir, original_path))


def append_if_not_in_list(item: any, list: list) -> None:
    """Helper function to append an item to a list if it is not already in the list."""
    if (item not in list):
        list.append(item)


def handle_import_line__module(line, modules_dict):
    """Extract the module name from the given line.
    Use the module name as a key in the dictionary of modules,
    to keep track of everything that needs to be imported from that module."""
    
    module_name = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip()
    
    if (module_name not in modules_dict):
        modules_dict[module_name] = []
    else:
        # DEBUG. TODO: Remove before pr
        print(f"Duplicate module import: {module_name}")
    
    line_pieces = line.split(" ")
    
    # line_pieces[0] is always "import" so skip to 1
    i = 1
    while (line_pieces[i] != "from"):
        import_name = line_pieces[i].replace("{", "").replace("}", "").replace(",", "")
        
        # import_name can be "" if there's a space between the import and the comma
        if (import_name != ""):
            append_if_not_in_list(line_pieces[i].replace(",", ""), modules_dict[module_name])
        i += 1


def handle_import_line__svg(line, svgs_dict):
    """Extract the SVG name and filename from the import statement.
    Add the SVG name and filename to the dictionary of SVGs, 
    so that the SVG can be imported after all components have been extracted."""
    
    svg_name = line.split(" ")[1]
    svg_relative_path = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip()
    
    if (svg_name in svgs_dict):
        print(f"Duplicate SVG import: {svg_name}")
        return
    
    svgs_dict[svg_name] = svg_relative_path


def handle_import_line__local_file(line, all_imports):
    line_pieces = line.split(" ")
    
    relative_path: str = ""
    if (line_pieces[0] == "import"):
        relative_path = line_pieces[-1].replace(";", "").replace("'", "").replace('"', "").strip()
        
    elif (line_pieces[0] == "const"):
        relative_path = line_pieces[-1].replace(";", "").replace("'", "").replace('"', "").replace("require(", "").replace(")", "").strip()
        
    else:
        print("Unknown import line format")
        return
    
    filename = relative_path.split("/")[-1].split(".")[0]
    import_file__local_component(filename, all_imports, make_path(relative_path))


def import_file__svg(output_file, svg_name, svg_relative_path):
    """Open an SVG file and write its contents to the output file.
    Ignores the <?xml> line and any comments."""
    
    output_file.write(f"const {svg_name} =")
    with open(make_path(svg_relative_path)) as svg_file:
        for line in svg_file:
            if ("<?xml" in line):
                continue
            # TODO: Better handle ignoring comments
            if ("<!--" in line or "-->" in line):
                continue
            output_file.write(" ".join(line.split()) + " ")


def import_file__local_component(component_name, all_imports, filepath=None):
    """Open a local component file and handle each line accordingly.
    Import statements are handled differently depending on the type of import.
    Non-import statements are appended to the component's string representation.
    Assumes that the component file is in the components directory, 
    with filename: {component_name}.js unless file_path is provided."""
    
    # For convienence
    svgs = all_imports["svgs"]
    modules = all_imports["modules"]
    components = all_imports["components"]
    
    if (filepath == None):
        filepath = make_path(f"./{component_name}.js")
    
    with open(filepath) as file:
        for line in file:
            if ("import " in line and " from " in line and ".svg" in line):
                handle_import_line__svg(line, svgs)
                
            elif ("import " in line and " from " in line and ".js" in line and "require" in line):
                print("require statement")
                
            elif ("import " in line and " from " in line and ".js" in line):
                handle_import_line__local_file(line, all_imports)
                pass
                
            elif ("import " in line and " from " in line):
                handle_import_line__module(line, modules)
                pass
            
            elif ("import " in line and ".css" in line):
                pass
            
            elif ("const " in line and "require(" in line):
                pass
                
            else:
                if (component_name not in components):
                    components[component_name] = ""
                components[component_name] += line


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--component", nargs="+", help="Name of component to extract.")
    args = parser.parse_args()
    
    # No component, no point
    if (args.component == None):
        print("No component name provided.")
        return
    
    # Dictionary to store all the imformation required to generate the output file
    # Not strictly only imports, but I couldn't think of a better name
    all_imports = {
        "modules": {},
        "components": {},
        "svgs": {}
    }
    
    # Import and save the contents of each component
    for component in args.component:
        import_file__local_component(component, all_imports)
    
    with open("./extraction_output.js", "w") as output_file:
        # Write the module imports to the output file
        for module_name, module_imports in all_imports["modules"].items():
            output_file.write(f"import {{ {', '.join(module_imports)} }} from {module_name};\n")
            
        # Separate each section with a newline
        output_file.write("\n")
        
        # Write the svgs to the output file
        for svg_name, svg_filename in all_imports["svgs"].items():
            import_file__svg(output_file, svg_name, svg_filename)
            output_file.write("\n\n")
            
        for _, component_content in all_imports["components"].items():
            output_file.write(component_content)
            output_file.write("\n\n")
            
        
    

if __name__ == "__main__":
    main()
