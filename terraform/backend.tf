terraform {
  backend "s3" {
    bucket         = "inl-tf-backend"
    key            = "con-pca-web"
    region         = "us-east-1"
    dynamodb_table = "inl-tf-lock"
  }
}
