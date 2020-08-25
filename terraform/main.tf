# ===========================
# FARGATE
# ===========================
locals {
  container_port = 443
  container_name = "pca-web"
}


module "container" {
  source    = "github.com/cisagov/fargate-container-def-tf-module"
  namespace = var.app
  stage     = var.env
  name      = "web"

  container_name  = local.container_name
  container_image = "${var.image_repo}:${var.image_tag}"
  container_port  = local.container_port
  region          = var.region
  log_retention   = 7

  environment = {
    "API_URL" : "https://${var.domain_name}:8043",
    "API_URL_HEADLESS" : "https://${var.domain_name}:8043",
    "AWS_PROJECT_REGION" : var.region,
    "AWS_USER_POOLS_ID" : element(tolist(data.aws_cognito_user_pools.users.ids), 0),

    "OAUTH_DOMAIN" : "${data.aws_ssm_parameter.cognito_domain.value}.auth.${var.region}.amazoncognito.com",
    "OAUTH_REDIRECT_URL" : "https://${var.domain_name}"
  }

  secrets = {
    "AWS_USER_POOLS_WEB_CLIENT_ID" : data.aws_ssm_parameter.client_id.arn
  }
}


module "fargate" {
  source    = "github.com/cisagov/fargate-service-tf-module"
  namespace = "${var.app}"
  stage     = "${var.env}"
  name      = "web"

  https_cert_arn                   = data.aws_acm_certificate.cert.arn
  container_port                   = local.container_port
  container_definition             = module.container.json
  container_protocol               = "HTTPS"
  container_name                   = local.container_name
  memory                           = 4096
  cpu                              = 2048
  vpc_id                           = var.vpc_id
  health_check_interval            = 120
  health_check_unhealthy_threshold = 5
  health_check_healthy_threshold   = 3
  health_check_path                = "/"
  health_check_codes               = "307,202,200,404,302"
  load_balancer_arn                = data.aws_lb.public.arn
  load_balancer_port               = 443
  desired_count                    = 1
  subnet_ids                       = var.private_subnet_ids
  security_group_ids               = [aws_security_group.web.id]
}


# ===========================
# SECURITY GROUP
# ===========================
resource "aws_security_group" "web" {
  name        = "${var.app}-${var.env}-web-alb"
  description = "Allow traffic for web from alb"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Allow container port from ALB"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [data.aws_security_group.alb.id]
    self            = true
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    "Name" = "${var.app}-${var.env}-gophish-alb"
  }

}
