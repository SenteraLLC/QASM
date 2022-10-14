# Task definition 
resource "aws_ecs_task_definition" "task_definition" {
    family = "${terraform.workspace}-qasm-${var.base_name}-task-definition"
    container_definitions = jsonencode([
        {
            "name": "${terraform.workspace}-qasm-${var.base_name}-task",
            "image": "475283710372.dkr.ecr.us-east-1.amazonaws.com/qasm:${terraform.workspace}-QASM-img",
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-region": "us-east-1",
                    "awslogs-group": "${var.log_group.name}",
                    "awslogs-stream-prefix": "qasm-${var.base_name}-task"
                }
            }
            "entryPoint": [
                "/bin/bash", 
                "-c",
                "conda run --no-capture-output -n rogue-venv ${var.cmd_prefix}python /terraform-backend/ecs_entrypoints/${var.script_name} ${var.script_args}"
            ]
        }
    ])
    execution_role_arn = var.exec_arn
    cpu = var.cpu
    memory = var.memory
    requires_compatibilities = ["FARGATE"]
    network_mode = "awsvpc"
}

# Associated Service 
resource "aws_ecs_service" "service" {
    name = "${terraform.workspace}-qasm-${var.base_name}-service"
    cluster = var.ecs_cluster_id
    task_definition = aws_ecs_task_definition.task_definition.arn
    desired_count = 0
    launch_type = "FARGATE"

    network_configuration {
        assign_public_ip = true 

        security_groups = [
            "sg-05a4a1dda783f3dec"
        ]

        subnets = [
            "subnet-04bf951166490b3cc",
            "subnet-0c7d337f7975ec37f"
        ]
    }
}