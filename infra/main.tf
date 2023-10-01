terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}




locals {
  function1_name = "create"
  handler1_name  = "main.handler"
  artifact1_name = "${local.function_name}/artifact.zip"
  function2_name = "get"
  handler2_name  = "main.handler"
  artifact2_name = "${local.function_name}/artifact.zip"
}




resource "aws_s3_bucket" "lambda" {
  bucket = "s3obituaries"
}

# output the name of the bucket after creation
output "bucket_name" {
  value = aws_s3_bucket.lambda.bucket
}


# two lambda functions w/ function url


resource "aws_lambda_function" "lambda" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = local.artifact_name1
  role          = aws_iam_role.lambda.arn
  function_name = local.function_name1
  handler       = local.handler_name1

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

# create a policy for publishing logs to CloudWatch
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs" {
  name        = "lambda-logging-${local.function_name}"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

# attach the above policy to the function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.logs.arn
}


# package code as zip files for bucket
data "archive_file" "save_lambda" {
  type        = "zip"
  source_file = "../functions/get-obituaries/main.py"
  output_path = "artifact.zip"
}

data "archive_file" "get_lambda" {
  type        = "zip"
  source_file = "../functions/create-obituaries/main.py"
  output_path = "getartifact.zip"
}



resource "aws_lambda_function" "lambda1" {
  #s3 bucket
  #s3 key
  role             = aws_iam_role.lambda1.arn
  function_name   = local.function1_name
  handler          = local.handler1_name
  filename         = local.artifact1_name 
  source_code_hash = data.archive_file.save_lambda.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function" "lambda2" {
  role             = aws_iam_role.lambda2.arn
  function_name    = local.get_function
  handler          = local.get_handler
  filename         = local.get_artifact
  source_code_hash = data.archive_file.get_lambda.output_base64sha256
  runtime          = "python3.9"
}




resource "aws_iam_policy" "logs1" {
  name        = "lambda-logging-${local.function1_name}"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "logs2" {
  name        = "lambda-logging-${local.function2_name}"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda1_logs" {
  role       = aws_iam_role.lambda1.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_iam_role_policy_attachment" "lambda2_logs" {
  role       = aws_iam_role.lambda2.name
  policy_arn = aws_iam_policy.logs.arn
}




resource "aws_lambda_function_url" "save_url" {
  function_name      = aws_lambda_function.save_lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

resource "aws_lambda_function_url" "get_url" {
  function_name      = aws_lambda_function.get_lambda.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}





# show the Function URL after creation
output "save_lambda_url" {
  value = aws_lambda_function_url.save_url.function_url
}

output "get_lambda_url" {
  value = aws_lambda_function_url.get_url.function_url
}


# one dynamodb table

# read the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
resource "aws_dynamodb_table" "obituaries-3014" {
  name         = "lotion-30148663"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  hash_key  = "email"
  range_key = "id"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}

# roles and policies as needed

resource "aws_iam_role" "lambda" {
  name               = "iam-for-lambda-${local.function1_name}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role" "lambda2" {
  name               = "iam-for-lambda-${local.function2_name}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
# step functions (if you're going for the bonus marks)
