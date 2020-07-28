data "aws_vpc" "vpc" {
  tags = {
    Name = "${var.app}-${var.env}-vpc"
  }
}

data "aws_subnet_ids" "public" {
  vpc_id = data.aws_vpc.vpc.id

  tags = {
    Name = "${var.app}-${var.env}-subnet-public*"
  }
}

data "aws_subnet_ids" "private" {
  vpc_id = data.aws_vpc.vpc.id

  tags = {
    Name = "${var.app}-${var.env}-subnet-private*"
  }
}

data "aws_lb" "public" {
  name = "${var.app}-${var.env}-public"
}

data "aws_security_group" "alb" {
  name = "${var.app}-${var.env}-alb-sg"
}

data "aws_cognito_user_pools" "users" {
  name = "${var.app}-${var.env}-users"
}

data "aws_ssm_parameter" "client_id" {
  name = "/${var.env}/${var.app}/cognito/client/id"
}

data "aws_ssm_parameter" "cognito_domain" {
  name = "/${var.env}/${var.app}/cognito/domain"
}

data "aws_iam_server_certificate" "self" {
  name = "${var.app}-${var.env}-alb"
}
