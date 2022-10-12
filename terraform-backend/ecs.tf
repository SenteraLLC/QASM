resource "aws_ecs_cluster" "qasm_ecs_cluster" {
    name = "${terraform.workspace}-qasm-cluster"
}
# ECS Tasks 

locals {
    binary_directory_args = "--operations \"$OPERATIONS\" --src_dir \"$SRC_DIR\" --dest_dir \"$DEST_DIR\""
    ecs_tasks = [
        {
            "base_name" = "binary-directory",
            "script_name" = "ecs_binary_directory.py", 
            "script_args" = local.binary_directory_args,
        }, 
    ]
}

module "ecs_tasks" {
    source = "./modules/ecs-tasks"
    for_each = {
        for index, ecs_task in local.ecs_tasks:
        ecs_task.base_name => ecs_task
    }
    base_name = each.value.base_name 
    script_name = each.value.script_name
    script_args = each.value.script_args
    cmd_prefix = try(each.value.cmd_prefix, "")
    cpu = try(each.value.cpu, 1024)  // default to 1 CPU unit
    memory = try(each.value.memory, 2048)  // default to 2 GB of memory

    log_group = aws_cloudwatch_log_group.ecs_api
    exec_arn = aws_iam_role.qasm_ecs_task_exec_role.arn
    ecs_cluster_id = aws_ecs_cluster.qasm_ecs_cluster.id
    ecs_cluster_name = aws_ecs_cluster.qasm_ecs_cluster.name
}