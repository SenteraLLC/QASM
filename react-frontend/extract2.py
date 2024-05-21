import argparse
from pprint import pprint


def append_if_not_in_list(item, list):
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
    svg_filename = line.split(" from ")[1].replace(";", "").replace("'", "").replace('"', "").strip().split("/")[-1]
    
    if (svg_name in svgs_dict):
        print(f"Duplicate SVG import: {svg_name}")
        return
    
    svgs_dict[svg_name] = svg_filename
            
            
def handle_import_line__local_component(line, all_imports):
    pass


def import_file__svg(output_file, svg_name, svg_filename):
    output_file.write(f"const {svg_name} = ")
    with open(f"./src/icons/{svg_filename}") as svg_file:
        for line in svg_file:
            if ("<?xml" in line):
                continue
            # TODO: Better handle ignoring comments
            if ("<!--" in line or "-->" in line):
                continue
            output_file.write(" ".join(line.split()) + " ")


def import_file__local_component(component_name, all_imports):
    """Open a local component file and handle each line accordingly.
    Import statements are handled differently depending on the type of import.
    Non-import statements are appended to the component's string representation."""
    
    with open(f"./src/components/{component_name}.js") as file:
        for line in file:
            if ("import " in line and " from " in line and ".svg" in line):
                handle_import_line__svg(line, all_imports["svgs"])
                
            elif ("import " in line and " from " in line and ".js" in line and "require" in line):
                print("require statement")
                
            elif ("import " in line and " from " in line and ".js" in line):
                # handle_import_line__module(line, all_imports["components"])
                pass
                
            elif ("import " in line and " from " in line):
                handle_import_line__module(line, all_imports["modules"])
                pass
                
            else:
                # components_dict[component_name] += line
                pass


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--component", nargs="+", help="Name of component to extract.")
    args = parser.parse_args()
    
    if (args.component == None):
        print("No component name provided.")
        return
    
    all_imports = {
        "modules": {},
        "components": {},
        "svgs": {}
    }
    
    for component in args.component:
        import_file__local_component(component, all_imports)
        
    # pprint(all_imports)
    
    with open("./extraction_output.js", "w") as output_file:
        for svg_name, svg_filename in all_imports["svgs"].items():
            print(svg_name, svg_filename)
            import_file__svg(output_file, svg_name, svg_filename)
            output_file.write("\n\n")
        
    

if __name__ == "__main__":
    main()
