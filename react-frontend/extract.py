import argparse
import typing
from pprint import pprint
import os

def get_folder_and_file(current_folder_path: str, relative_file_path: str) -> tuple[str, str]:
    """Return the absolute folder path and the file name from a file path relative to the current folder.
    
    Arguments:
    current_folder_path -- The path to the current folder. Can be absolute or relative to the script root.
    relative_file_path -- The path to the file relative to the current folder.
    """
    
    script_root_dir = os.getcwd()
    current_folder_absolute = os.path.abspath(os.path.join(script_root_dir, current_folder_path))
    relative_folder_path, filename = relative_file_path.rsplit("/", 1)
    new_folder_absolute = os.path.abspath(os.path.join(current_folder_absolute, relative_folder_path))

    return new_folder_absolute, filename


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


def handle_import_line__local_file(line, all_imports, current_folder_path: str):
    line_pieces = line.split(" ")
    
    relative_path: str = ""
    if (line_pieces[0] == "import"):
        relative_path = line_pieces[-1].replace(";", "").replace("'", "").replace('"', "").strip()
        
    elif (line_pieces[0] == "const"):
        relative_path = line_pieces[-1].replace(";", "").replace("'", "").replace('"', "").replace("require(", "").replace(")", "").strip()
        
    else:
        print("Unknown import line format")
        return 
    
    new_folder, filename = get_folder_and_file(current_folder_path, relative_path)
    
    import_file__local_file(filename, new_folder, all_imports)


def write_svg_to_output(output_file, svg_path):
    """Open an SVG file and write its contents to the output file.
    Ignores the <?xml> line and any comments."""
    
    with open(svg_path) as svg_file:
        for line in svg_file:
            if ("<?xml" in line):
                continue
            # TODO: Better handle ignoring comments
            if ("<!--" in line or "-->" in line):
                continue
            output_file.write(" ".join(line.split()) + " ")


def import_file__local_file(file_name, folder_path, all_imports):
    """Extract the imports and content from a local file.
    
    Arguments:
    component_name -- The name of the file to extract.
    path -- Path to the file's folder relative to react-frontend 
    all_imports -- A dictionary containing the imports and content of all files.
    """
    
    # For convienence
    svgs = all_imports["svgs"]
    modules = all_imports["modules"]
    components = all_imports["components"]
    
    with open(folder_path + "/" + file_name) as file:
        for line in file:
            if ("import " in line and " from " in line and ".svg" in line):
                handle_import_line__svg(line, svgs)
                
            elif ("import " in line and " from " in line and ".js" in line and "require" in line):
                print("require statement... skipping")
                
            elif ("import " in line and " from " in line and ".js" in line):
                handle_import_line__local_file(line, all_imports, folder_path)
                
            elif ("import " in line and " from " in line):
                handle_import_line__module(line, modules)
            
            elif ("import " in line and ".css" in line):
                pass
            
            elif ("const " in line and "require(" in line):
                handle_import_line__local_file(line, all_imports, folder_path)
            
            elif ("export default" in line):
                continue
            
            elif ("class " in line and "extends" in line):
                if (file_name not in components):
                    components[file_name] = ""
                components[file_name] += "export " + line
                
            else:
                if (file_name not in components):
                    components[file_name] = ""
                components[file_name] += line


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
        import_file__local_file(component + ".js", "./src/components", all_imports)
    
    with open("./extraction_output.js", "w") as output_file:
        # Write the module imports to the output file
        for module_name, module_imports in all_imports["modules"].items():
            output_file.write(f"import {{ {', '.join(module_imports)} }} from {module_name};\n")
            
        # Separate each section with a newline
        output_file.write("\n")
        
        # Write the svgs to the output file
        for svg_name, svg_filename in all_imports["svgs"].items():
            # All the svg_filenames are paths relative to the components folder
            folder_path, filename = get_folder_and_file("./src/components", svg_filename)
            
            output_file.write(f"const {svg_name} =")
            write_svg_to_output(output_file, folder_path + "/" + filename)
            output_file.write("\n\n")
            
        for _, component_content in all_imports["components"].items():
            output_file.write(component_content)
            output_file.write("\n\n")
            
        
    

if __name__ == "__main__":
    main()
