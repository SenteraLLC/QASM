# Getting Started with QASM

Welcome to the Quality Assurance State Machine (QASM)! QASM is a single-serve web application that runs
using React and Electron, with the ability to run customizable QA jobs from a local host, a packaged windows .exe, or a statically hosted S3 website.

## Demo
A demo of the app can be found [here](http://qasm-demo-frontend.s3-website-us-east-1.amazonaws.com/). The configuration used to generate the demo is found in `react-frontend/default-config.json`.

## Installation 

1) Navigate to the frontend and install necessary packages

        >> cd react-frontend
        >> npm install

2) The main app entrypoint is the python script ``react-frontend/QASM.py``. This script will launch the Electron app and serve the React app. It does require some python dependencies, which can be installed using:

        >> pip install -r requirements.txt
        
3) The app can be run locally using

        >> npm run qasm

    This will launch an app based on the specifications found in ``react-frontend/config.json`` if present, else it will copy ``react-frontend/default-config.json``, load it, and save it to ``react-frontend/config.json``. 

    Note that for any backend functionality that requires AWS (ie running in `"s3"` mode), you will need to have AWS credentials set up on your machine. See [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) for more information. 

    Once your AWS credentials are set, you will need to deploy the backend to AWS using [Terraform](#terraform).

4) To create a Windows executable of the current configuration, run

        >> npm run qasm-build

    Which will deposit the executable in ``react-frontend/dist``. Note that this will only work on Windows machines.

5) To run using a specific configuration file, use

        >> npm run qasm -- --config_path <path/to/config.json>

If encountering the error: `POST http://localhost:3000/undefinedopen_dir 431 (Request Header Fields Too Large)` when launching, ensure that the `react-frontend/.env.development` and `react-frontend/.env.production` files have been generated locally by running:
    
        >> terraform workspace select dev
        >> terraform apply
        >> terraform workspace select prod
        >> terraform apply

Note that this will also apply any changes made to the terraform code, so be sure to double check that you are not accidentily destroying any resources.


## Usage
QASM is a single-serve web application that can be run locally, as a packaged windows .exe, or as a statically hosted S3 website. The difference between these options is as follows:

### Deployment Options
#### Local
Running locally will launch the Electron app and serve the React app from the local machine. This is useful for development and testing, but is not recommended for production use. Not that running *locally* is different then running in *local mode*. Running locally will launch the Electron app and serve the React app from the local machine, but the React app will still be configured to run in either `s3` or `local` mode, which refers to which backend framework will be used in the app. See [Configuration](#configuration) for more details.

#### Windows .exe
After building a Windows .exe following the instructions in [Installation](#installation), the app can be run by simply double clicking the .exe file. This will preform a one-time installation and run QASM as a Windows application, after which it can be run by double clicking the application shortcut or however you prefer to run Windows applications. Note that the `"name"` field in the configuration file will be used as the name of the application, so configurations with the exact same name with overwrite each other, which is intended behavior to enable versioning without creating spurious applications. If different installations are needed, simply change the `"name"` field in the configuration file.

#### S3 Static Website
The S3 Static Website deployment option is an easy way to setup a public website and url from which anyone can access a QASM job. In the config field `"static_site_bucket"`, put the desired name of an s3 bucket that will host the QASM app. Run `npm run qasm-push`, which will create and setup an S3 bucket with the name you specified, build the app, and upload the contents of the ``react-frontend/build`` folder to the bucket. Note that the bucket created by this process will be public, so anyone with the url will be able to access the app. The website URL will be printed to the console if the process is successful.

Alternatively, see the AWS [docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html) for a more detailed explanation of how to manually setup a static website on S3. Follow the steps in the link provided above to setup an S3 bucket and configure it to host a static website. Once the bucket is configured, you can build the app by running `npm run qasm-build`. Then upload the build files manually via the AWS console (just upload the contents of `react-frontend/build` to the bucket), or via the AWS CLI using

        >> aws s3 sync react-frontend/build s3://<bucket_name_here>
***Note that this deployment method currently only supports `"app": "s3"` mode.

### Backend Options
#### Local
An app configured with `"app": "local"` will run using files on the local machine. QASM jobs that require images or other inputs will prompt the user to select files using the Windows File Explorer. Note that this option is currently not supported for S3 static websites.

#### S3
An app configured with `"app": "s3"` will run using files on S3. QASM jobs that require images or other inputs will prompt the user to select files using the S3 Browser component. The S3 Browser component will allow the user to select files from any S3 bucket that they have access to. The S3 Browser component will also allow the user to upload files to the selected bucket. Note that the S3 Browser component will only allow the user to select files from a single bucket at a time, which is specified in the config file under the `"bucket"` field.

## Configuration

``react-frontend/config.json`` expects the following fields:

- ``"app": <string>``
    - ``"s3"`` for an app that runs using AWS Cloud resources managed by [Terraform](#terraform).
    - ``"local"`` for an app that runs using local files

- ``"bucket": <string>``
    - Name of the s3 bucket from which to pull data (only required for ``"app": "s3"``)

- ``"intercept_s3_protocol": <Array>``
    - (Optional) Only availible for ``"app": "s3"`` mode. When present, clicking/navigating to a link that starts with ``"s3://"`` will open a prompt to open the link in the app instead. The value in the config should be a list of component names, as shown in the example below. The first component in the list will be the default handler for s3 links, *except* when another component in the list is currently open. For example, if the ``"grid"`` screen is open, it will handle all s3 links, even though ``"imagelabeler"`` is listed first in the list. Example:
    ```js
    "intercept_s3_protocol": [
        "imagelabeler",
        "grid"
    ]
    ```
    - Components that currently have special s3 protocol functionality are as follows:
        - ``"imagelabeler"``: If the s3 link points to an image, the image will be loaded into the imagelabeler component. If the s3 link points to a json file, the file will be loaded as an annotation. If the s3 link points to a directory, the user will be prompted to select if it should be loaded as the image or annotation directory.
        - ``"grid"``: If the s3 link points to an json file, the file will be loaded as a labels file. If the s3 link points to a directory, the directory will be used as the image directory and the images will be loaded.
        - ``"multiclassgrid"``: Same as ``"grid"``

- ``"static_site_bucket": <string>``
    - (Optional) Name of the s3 bucket to which to upload the static website (only required to run ``npm run qasm-push``)

- ``"name": <string>``
    - (Optional) Display name of the app

- ``"components": <Array>`` Array of component config objects. Order of the components is the order they appear in the toolbar
    - Required for all components:
        - ``"component": <string>`` One of the following component names:
            - ``"home"`` for a home screen, which shows the QASM Logo and a button to show the active config JSON. If not included, the home screen will not be shown in the navbar, but can still be accessed by pressing the QASM logo in the top left corner.
            - ``"grid"`` for a grid of images, and the ability to label each image as a single class type
            - ``"multiclassgrid"`` for a grid of images that supports multiple class types per image
            - ``"imagelabeler"`` for a [ULabel](https://github.com/SenteraLLC/ulabel) image labeling tool
            - ``"binaryeditor"`` for a binary image editor, where simple dilation and erosion operations can be performed

    - Optional for all components:
        - ``"display_name": <string>`` Change the navbar display name
 
    - ``"grid"`` Configuration ``<Object>``:
        - ``"grid_width": <Number>`` Default number of images to show per row
        - ``"classes": <Array>``
            - ``<Object>`` with class details
                - ``"class_name": <string>`` (Required) Custom name for a class
                - ``"svg_overlay": <string>`` (Optional) Name of the class overlay
                    - ``"x_overlay"`` for a big red 'X'
                    - ``"sparse"`` for very spaced out dots (*Color options not implemented*)
                    - ``"criss_cross"`` for grid of criss crossing lines (*Color options not implemented*)
                    - ``"curved"`` for curved lines (*Color options not implemented*)
                    - ``"field_edge"`` for parallel lines next to a blob of vegetation (*Color options not implemented*)
                    - ``null`` for nothing
                - ``"color": <string>`` (Optional) Color of overlay
                    - ``"red"`` red
                    - ``"yellow"`` yellow
                    - ``"white"`` white
                    - ``"green"`` green
        - ``"label_loadnames": <Array[string]>`` (Optional) An ordered list of label filenames to automatically try and load. Will search one folder above the current directory.
        - ``"autoload_labels_on_dir_select": <boolean>`` (Optional) Whether to try and autoload labels after each new directory selection. Default is false. Can also be changed in app via the checkbox "Autoload Labels on Directory Select". Default is false.
        - ``"image_layer_folder_names": Array[Array[<string>], ...]``: (Optional) Ordered list of folder names of image layers to automatically try and load when a directory is selected. Supports having multiple anticipated folder names. Eg, for an input shown below, the first set of `_thumbnails` layers will try and load, and if any of them are not present, it will instead load the next Array of folders. Preference is given to the folders in any Array that contains the name of the currently selected folder, eg if the currently selected folder is `nadir`, then ``bottom` and `oblique` would be loaded.
            ```js
            "image_layer_folder_names": [
                [
                    "bottom_thumbnails",
                    "nadir_thumbnails",
                    "oblique_thumbnails"
                ],
                [
                    "bottom",
                    "nadir",
                    "oblique"
                ]
            ]
            ```
        - ``"save_labels_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to save the current labels. Defaults to ["ctrlKey", "s"].
        - ``"toggle_image_layer_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to toggle between image layers when hovering over an image. Defaults to "b".
        - ``"toggle_all_image_layers_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to toggle the image layer of all images. Defaults to "B".
        - ``"next_row_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to advance to the next row when hovering over an image. Defaults to "n".
        - ``"prev_row_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to advance to the previous row when hovering over an image. Defaults to "h".
        - ``"next_dir_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to advance to the next directory. Defaults to "Enter".

    - ``"multiclassgrid"`` Configuration ``<Object>``:
        - ``"grid_width": <Number>`` Default number of images to show per row
        - ``"classes": <Array>``
            - ``<string>: <Object>`` class type with class details object
                - ``"class_values": <Array[string]>`` (Required) List of class values within the class type
                - ``"selector_type": <string>`` (Required) Method of selecting between class values in app
                    - ``"radio"`` Radio buttons
                    - ``"checkbox"`` Checkboxes
                - ``"default": <string>`` (Optional) Default class value for this class type. Must be one of the class_values.
                - ``"class_colors": <Object>`` (Optional) Text colors used in the class selector
                    - ``<string>: <string>`` The key must be one of the class_values. The value must be a valid css color (name or hexcode).
                        - Ex: to make the class_value `"Normal"` appear in blue text, ``"Normal": "blue"``
                - ``"class_overlays": <boolean>`` (Optional) Whether to have an "X" appear in the bottom left of every class that has an assigned `class_color`
        - ``"label_savenames": <Object>`` (Optional) Define custom buttons that will allowing saving to a custom filename.
            - ``<string>: <string>`` Where the key is the name that will appear on the button and the value is the filename.
        - ``"label_loadnames": <Array[string]>`` (Optional) An ordered list of label filenames to automatically try and load. Will search one folder above the current directory.
        - ``"autoload_labels_on_dir_select": <boolean>`` (Optional) Whether to try and autoload labels after each new directory selection. Default is false. Can also be changed in app via the checkbox "Autoload Labels on Directory Select". Default is false.
        - ``"image_layer_folder_names": Array[Array[<string>], ...]``: (Optional) Ordered list of folder names of image layers to automatically try and load when a directory is selected. See ``"grid"`` for more details.
        - ``"save_labels_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to save the current labels. Defaults to ["ctrlKey", "s"].
        - ``"toggle_image_layer_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to toggle between image layers when hovering over an image. Defaults to "b".
        - ``"toggle_all_image_layers_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to toggle the image layer of all images. Defaults to "B".
        - ``"next_row_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to advance to the next row when hovering over an image. Defaults to "n".
        - ``"prev_row_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to advance to the previous row when hovering over an image. Defaults to "h".
        - ``"next_dir_keybind": <string> or <Array[<string>]>`` (Optional) Keybind to advance to the next directory. Defaults to "Enter".
                

    - ``"imagelabeler"`` Configuration ``<Object>``:
        ULabel is the core of this component. Find the most recent ULabel API spec [here](https://github.com/SenteraLLC/ulabel/blob/main/api_spec.md). Of the required fields in the ULabel constructor object, `container_id`, `image_data`, and `on_submit` are handled internally by this component. The `subtasks` field is also handled internally, but can be configured via the `subtasks` field in the config file. The remaining fields can be included in the config and will be passed directly to the ULabel constructor, so see the API Spec for details. The following fields are also supported:
        - ``"subtasks": <Object>`` ULabel [subtasks](https://github.com/SenteraLLC/ulabel/blob/044c24072fe00a30b89e0f370fb8d4ddad28b59d/api_spec.md#subtasks) definition(s) 
            - ``<string>: <Object>`` Custom subtask name, followed by the subtask definition object
                - ``"display_name": <string>`` Displayed subtask name
                - ``"classes": <Array>`` List of class definition objects
                    - ``<Object>`` Object with class definition
                        - ``"name": <string>`` Class name
                        - ``"color": <string>`` Class color
                        - ``"id": <Number`` Class id number
                - ``"allowed_modes: <Array>"`` List of allowed annotation modes
                    - ``"polyline":`` A simple series of points that needn't define a closed polygon
                    - ``"bbox":`` A simple single-frame bounding box
                    - ``"bbox3":`` A bounding box that can extend through multiple frames
                    - ``"polygon":`` A simple series of points that must define a closed polygon
                    - ``"tbar":`` Two lines defining a "T" shape
                    - ``"contour":`` A freehand line
                    - ``"whole-image":`` A label to be applied to an entire frame
                    - ``"global":`` A label to be applied to the entire series of frames
                    - ``"point":`` A keypoint within a single frame 
                - ``"resume_from": <string>`` (Optional) Key used in annotation jsons. Used to load in annotations from the annotation directory (*Use `null` for no anno loading`*)
        - ``"image_dir": <string>`` (Optional) Path to directory of images
        - ``"anno_dir": <string>`` (Optional) Path to directory of labels or annotations


    - ``"binaryeditor"`` Configuration ``<Object>`` (s3 mode only):
        - ``"dilate_keybind": <string> or <Array[<string>]>`` Keybind to dilate the binary. Defaults to "="
        - ``"erode_keybind": <string>`` Keybind to erode the binary. Defaults to "-"

## Keybinds
Certain components support user-defined keybinds for set operations. Keybinds are stored in the following format:
`{<string keybind_name>: <string keybind> or Array[<string keybind1>, <string keybind2>], ...}`

Example:
```
{   
    ...,
    "save_labels_keybind": ["ctrlKey", "s"],
    "toggle_image_layer_keybind": "b",
    "next_row_keybind": ["ctrlKey", "ArrowDown"],
    "prev_row_keybind": ["ctrlKey", "ArrowUp"],
}
```
The "control", "shift", and "alt" keys are represented by "ctrlKey", "shiftKey", and "altKey", 
since that is how they are represented in the keydown event. See [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) for more details. Providing an array of keybinds requires all keys to be pressed simultaneously, and thus is only supported for the "control", "shift", and "alt" keys and any single other key, eg ["ctrlKey", "shiftKey", "s"].



## Terraform
Terraform automatically takes our lambda code and deploys it to all the necessary AWS services (Lambda, API Gateway, IAM, etc) to allow our serverless applications to run.

Install Terraform (https://learn.hashicorp.com/tutorials/terraform/install-cli)

Start a new project or connect to an existing Terraform project

        >> cd terraform-backend
        >> terraform init

Note: Since S3 buckets are globally scoped (no two buckets can share the same name), you may need to change the bucket name in the terraform code. To do this, open the file ``terraform-backend/main.tf`` and change references to the bucket name ``qasm-lambdas`` to something unique.

To prevent developer testing from interfering with active users, we can utilize terraform 'workspaces' to keep development and production environments seperate.

To work in the development workspace, use

        >> terraform workspace select dev

And for production,

        >> terraform workspace select prod

Both workspaces use the same source code, but the prefix "${terraform.workspace}-" is added to every unique resource, so that the two workspaces deploy to seperate 'dev' and 'prod' AWS resources. When creating new resouces, be sure to add this prefix so as to avoid hidden dependencies.


To deploy changes to a Terraform project, use

        >> terraform apply

You will be shown a summary of the changes that terraform will be applying, so be sure to double check that (a) you are on the desired workspace and (b) that you aren't accidentily destroying unexpected resources. To check what workspace you are in, you can use 

        >> terraform workspace list


Once changes have been tested in development and are ready to be applied to the production resources, these changes are applied by simply switching workspaces and running the apply command. 

        >> terraform workspace select prod
        >> terraform apply


## Development
The core Electron logic is found in ``react-frontend/public/electron.js``. This file will launch the Electron app and load the React app. In order to initialize the local backend, the functions found in ``react-frontend/public/electron_utils.js`` are automatically exposed to the Electron runtime via the logic found in ``react-frontend/public/preload.js``. 

The main React entrypoint is ``react-frontend/src/index.js``. This file will load the config file and use it to initialize the React app in the configured mode (ie `local` or `s3`). The two different modes are setup in ``react-frontend/src/QASM/QASM.js``. The `local` mode will load the React app using the local backend (the functions defined in ``react-frontend/public/electron_utils.js``), while the `s3` mode will load the React app using the AWS backend (the functions found in ``react-frontend/src/QASM/lambda_handlers.js``). As long as any new functions are added to the list of ``function_handlers`` within ``lambda_handlers.js``, they will be automatically be exposed to the React app.

When adding any backend functionality, in order for it to be compatible with both modes, the function must be defined in both ``electron_utils.js`` and ``lambda_handlers.js``. The decision of which backend to use is made in ``QASM.js`` based on the config file, and so within the React components, both backends are accessed via ``this.QASM.call_backend(window, <function_name_here>, <function_args_here>)``. This function will automatically call the correct backend based on the configured mode.

### Local Backend
As long as any new functions are added to the list of ``exports.function_handlers`` within ``electron_utils.js``, they will be automatically be exposed to the Electron runtime in local mode. By addition the function logic to ``electron_utils.js``, the function will be available within any React component via ``this.QASM.call_backend(window, <function_name_here>, <function_args_here>)``. Since the backend is running locally, the function will be called directly, and there is access to the local Windows file system via the ``fs`` module.

### AWS Backend
In order to add a new function to the AWS backend, the function must be added to the list of ``exports.function_handlers`` within ``lambda_handlers.js``. This will automatically expose the function to the React app in s3 mode. Since the backend is running on AWS, the function will be called via an API call to AWS API Gateway. The function will access the AWS S3 bucket that is configured in the ``config.json`` file instead of the local file system. 

Adding s3 compatibility is comprised of two steps: (1) adding the function to ``lambda_handlers.js`` and (2) adding the function to the AWS API Gateway via Terraform.

1) The functions in ``lambda_handlers.js`` ultimately are just intermediate steps that call some AWS API Gateway endpoint that points to a AWS Lambda function defined in ``terraform-backend/lambdas/``. Common operations involved opening the S3 Browser component to allow the user to make some selection, and/or parsing the input arguments and passing them to the AWS Lambda function. The AWS Lambda function will then perform the desired operation and return the result.

2) The AWS Lambda function is defined in ``terraform-backend/lambdas/``. The function is defined in one of the python files (for example, ``s3_browser.py``) as a single python function ``function_name_here(event, context)``. The arguments that are passed in from the ``lambda_handlers.js`` function are available in the ``event`` variable. See some of the functions in ``s3_browser.py`` for examples of how to read from the event, handle the AWS logic, and return the result.

The python logic is then passed into the AWS Lambda function via Terraform. When adding a new function, add a handler block to the list of ``lambda_defs`` in ``terraform-backend/lambdas.tf``. The handler block should look like:
    ```
        { 
            base_name = "function-name-here"
            handler = "python_filename_here.function_name_here"
        },
    ```
This file will automatically take the python code and deploy it to the AWS Lambda function.

### React Components
The React components are found in ``react-frontend/src/Components/``. Each component is defined in a file ``<component_name>.js``. The component is then imported into ``react-frontend/src/App.js`` and added to the list of components. To enable a component to be added to the ``config.json``, the component must be added (1) to the list of ``COMPONENT_KEYS`` in ``react-frontend/src/App.js`` as well as (2) the list of ``QASM_COMPONENTS`` in ``QASM.py``.