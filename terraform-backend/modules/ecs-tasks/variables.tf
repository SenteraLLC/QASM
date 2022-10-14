# Variables
variable "base_name" {
    description = "Base name for ECS process and tasks."
    type = string 
}

variable "script_name" {
    description = "Name of the script to run."
    type = string
}

variable "script_args" {
    description = "Arguments to pass to the script."
    type = string
}

variable "cmd_prefix" {
    description = "Command prefix to run the script."
    type = string
}

variable "cpu" {
    description = "Number of CPU units to allocate to the task."
    type = number
    default=1024
}
variable "memory" {
    description = "Amount of memory to allocate to the task."
    type = number
    default=2048
}

variable "log_group" {
    description = "Log group for the ECS process."
    type = object({
        name = string
        retention_in_days = number
    })
}

variable "exec_arn" {
    description = "Execution ARN for the ECS process."
    type = string
}

variable "ecs_cluster_id" {
    description = "ECS cluster ID."
    type = string
}

variable "ecs_cluster_name" {
    description = "ECS cluster name."
    type = string
}


