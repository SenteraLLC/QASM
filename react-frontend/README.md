# Getting Started with QASM

Welcome to the Quality Assurance State Machine (QASM)! QASM is a single-serve web application that runs
using React, with the ability to run customizable QA jobs locally or via a statically hosted S3 website.  

### Installation 

1) Navigate to the frontend, install necessary packages, and run

        >> cd react-frontend
        >> npm install 
        >> npm run QASM

This will build an app based on the specifications found in ``react-frontend/config.json``.

### Configuration

``react-frontend/config.json`` expects the following fields:

- ``"app": <string>``
    - ``"s3"`` for an app that pulls files from the specified s3 bucket (see below)
    - ``"local"`` for an app that runs using local files

- ``"bucket": <string>``
    - Name of the s3 bucket from which to pull data (only required for ``"app": "s3"``)

- ``"name": <string>``
    - (Optional) Display name of the app

- ``"components": <Object>`` Object keys are the names of desired app components
    - ``"home": <Object>``
        - ``"display_name": <string>`` (Optional) Change the navbar display name
    - ``"grid": <Object>``
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
        - ``"display_name": <string>`` (Optional) Change the navbar display name
    - ``"binaryeditor": <Object>``
        - ``"display_name": <string>`` (Optional) Change the navbar display name
        - ``"dilate_keybind": <string>`` (Optional) Change the dilation keybind. Defaults to "="
        - ``"erode_keybind": <string>`` (Optional) Change the erosion keybind. Defaults to "-"
    - ``"imagelabeler": <Object>``
         - ``"display_name": <string>`` (Optional) Change the navbar display name
         - ``"image_dir": <string>`` (Optional) Path to directory of images
         - ``"anno_dir": <string>`` (Optional) Path to directory of labels/annotations
         - ``"subtasks": <Object>`` ULabel subtasks definition(s)
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

### Terraform
Terraform automatically takes our lambda code and deploys it to all the necessary AWS services (Lambda, API Gateway, IAM, etc) to allow our serverless applications to run.

Install Terraform (https://learn.hashicorp.com/tutorials/terraform/install-cli)

Connect to an existing Terraform project

        >> cd terraform-backend
        >> terraform init

To prevent developer testing from interfering with active users, we utilize terraform 'workspaces' to keep development and production environments seperate.

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
