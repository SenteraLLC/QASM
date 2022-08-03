terraform {
    backend "s3" {
        bucket = "qasm-lambdas"
        key    = "terraform.tfstate"
        region = "us-east-1"
    }
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 4.0.0"
        }
    }
    required_version = "~> 1.0"
}

provider "aws" {
    region = "us-east-1"
}

# Lambda S3 Bucket 
resource "aws_s3_bucket" "lambda_s3_bucket" {
    bucket = "qasm-lambdas"
}

resource "aws_s3_bucket_public_access_block" "lambda_s3_bucket_access" {
    bucket = aws_s3_bucket.lambda_s3_bucket.id  

    block_public_acls = true
    block_public_policy = true
    restrict_public_buckets = true 
    ignore_public_acls = true 
}


# Lambda Zip File to S3
data "archive_file" "lambda_zip" {
    type = "zip"
    source_dir = "${path.module}/lambdas"
    output_path = "${path.module}/lambdas.zip"
}

resource "aws_s3_object" "lambda_zip" {
    bucket = aws_s3_bucket.lambda_s3_bucket.id

    key = "${terraform.workspace}-lambdas.zip"
    source = data.archive_file.lambda_zip.output_path

    etag = filemd5(data.archive_file.lambda_zip.output_path)
}
