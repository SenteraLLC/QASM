output "ecs_cluster_name" { 
    value = var.ecs_cluster_name
}
output "task_name" {
    value = "${terraform.workspace}-qasm-${var.base_name}-task"
}
output "task_def_id" {
    value = aws_ecs_task_definition.task_definition.id
}
output "task_revision" {
    value = aws_ecs_task_definition.task_definition.revision
}
