import json

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings
from app.common.enums import MediaEntities

access_key_id = settings.S3_ACCESS_KEY_ID
secret_access_key = settings.S3_SECRET_ACCESS_KEY
endpoint_url = settings.S3_URL

s3_client = boto3.client('s3',
    aws_access_key_id=access_key_id,
    aws_secret_access_key=secret_access_key,
    endpoint_url=endpoint_url
)

def get_s3_storage():
    return s3_client


def set_bucket_public_policy(bucket_name):
    policy = {
        "Version": "2012-10-17",
        "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*"
                }
            ]
        }
    
    s3_client.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
    


def create_buckets():
    for bucket in MediaEntities:
        try:
            s3_client.head_bucket(Bucket=bucket.value)
        except ClientError:
            s3_client.create_bucket(Bucket=bucket.value)
        
        set_bucket_public_policy(bucket.value)