# IAM Policy Documents 
data "aws_iam_policy_document" "ecs_task_assume_role" {
    statement {
        actions = ["sts:AssumeRole"]

        principals {
            type = "Service"
            identifiers = ["ecs-tasks.amazonaws.com"]
        }
    }
}

# IAM Policies 
resource "aws_iam_policy" "qasm_ecs_run_policy" {
    name = "qasm-${terraform.workspace}-ecs-run-policy"
    description = "QASM ECS Run Policy"

    policy = jsonencode({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": [
                    "iam:*",
                    "ecs:RunTask",
                    "s3:*",
                    "dynamodb:*",
                    "ecs:*",
                    "ecr:*",
                ],
                "Effect": "Allow",
                "Resource": "*"
            }
        ]
    })
}

data "aws_iam_policy" "ecs_task_execution_role" {
    arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "function_logging_policy" {
  name   = "qasm-${terraform.workspace}-function-logging-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      }
    ]
  })
}


# IAM Roles
resource "aws_iam_role" "qasm_lambda_exec_role" {
    name = "qasm-${terraform.workspace}-lambda-exec-role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Sid    = ""
                Principal = {
                    Service = "lambda.amazonaws.com"
                }
            }
        ]
    })
}
resource "aws_iam_role" "qasm_ecs_task_exec_role" {
    name = "qasm-${terraform.workspace}-ecs-task-exec-role"
    assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

# Policy Attachments
resource "aws_iam_role_policy_attachment" "_" {
    role = aws_iam_role.qasm_lambda_exec_role.id
    policy_arn = aws_iam_policy.qasm_ecs_run_policy.arn
}
resource "aws_iam_role_policy_attachment" "_2" {
    role = aws_iam_role.qasm_lambda_exec_role.id
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "_3" {
    role = aws_iam_role.qasm_lambda_exec_role.name 
    policy_arn = data.aws_iam_policy.ecs_task_execution_role.arn
}

resource "aws_iam_role_policy_attachment" "_4" {
    role = aws_iam_role.qasm_lambda_exec_role.name 
    policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

resource "aws_iam_role_policy_attachment" "function_logging_policy_attachment" {
  role = aws_iam_role.qasm_lambda_exec_role.id
  policy_arn = aws_iam_policy.function_logging_policy.arn
}