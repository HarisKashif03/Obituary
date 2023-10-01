# add your create-obituary function here
from requests_toolbelt.multipart import decoder
import requests
import boto3
import base64
import os
import time
import hashlib
import json
import uuid
from datetime import datetime


dynamodb_resource = boto3.resource("dynamodb")
data_table = dynamodb_resource.Table("thelastshow-30140813")

client = boto3.client('ssm')

api_key = client.get_parameter(
    Name='Cloudinary_and_GPT_Keys',
    WithDecryption=True
)

api_secret = client.get_parameter(
    Name='CloudinarySecret',
    WithDecryption=True
)

gpt_api = client.get_parameter(
    Name='GptKey',
    WithDecryption=True
)

cloud_Name = client.get_parameter(
    Name='CloudName',
    WithDecryption=True
)

def lambda_handler(event, context):
    body = event['body']
    if event['isBase64Encoded']:
        body = base64.b64decode(body)
    content_type = event['headers']['content-type']
    multipart_data = decoder.MultipartDecoder(body, content_type)
    file_data = multipart_data.parts[0].content
    name = multipart_data.parts[1].text
    born = multipart_data.parts[2].text
    died = multipart_data.parts[3].text
    upload_file_to_s3('/tmp/obituary.png', 'thelastshow-hs', 'obituary.png')
    upload_res = upload_file_to_cloudinary('/tmp/obituary.png', extra_fields={'eager': 'e_art:zorro,e_grayscale'})
    obituary_text = generate_obituary(name, born, died)
    generate_audio(obituary_text)
    audio_res = upload_file_to_cloudinary('/tmp/polly.mp3', resource_type='raw')
    obituary = {
        'Name': name,
        'uuid': str(uuid.uuid1()),
        'birth': born,
        'death': died,
        'image': upload_res['eager'][0]['secure_url'],
        'memoir': obituary_text,
        'audio': audio_res['secure_url'],
        'creation': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    add_obituary_to_dynamodb(obituary)
    return {
        'statusCode': 201,
        'body': json.dumps(obituary)
    }

def upload(filename, resource_type="image", extra_fields={}):
    cloudinary.config(
        cloud_name = "CLOUD_NAME",
        api_key = "API_KEY",
        api_secret = "API_SECRET"
    )

    timestamp = int(time.time())
    upload_params = {
        "timestamp": timestamp,
        "resource_type": resource_type,
        **extra_fields,
    }

    result = cloudinary.uploader.upload(filename, **upload_params)

    return result


def create_signature(body, api_secret):
    exclude = ["api_key", "resource_type", "cloud_name"]
    timestamp = int(time.time())
    body["timestamp"] = timestamp
    sorted_body = sort(body, exclude)
    q_s = query_string(sorted_body)
    q_s_append = f"{q_s}{api_secret}"
    hashed = hashlib.sha1(q_s_append.encode())
    signature = hashed.hexdigest()
    return signature


def sort(dic, exclude):
    return {k: v for k, v in sorted(dic.items(), key=lambda item: item[0]) if k not in exclude}


def query_string(body):
    return cloudinary.utils.generate_signature(body, api_secret)

def chatgpt(name, born_year, died_year):
    openai.api_key = gpt_api
    prompt = f"write an obituary about a fictional character named {name} who was born on {born_year} and died on {died_year}"
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100,
        temperature=0.1
    )
    return response["choices"][0]["text"]

def audio(text):
    polly_client = boto3.client('polly')
    response = polly_client.synthesize_speech(
        Engine='standard',
        LanguageCode='en-US',
        OutputFormat='mp3',
        Text=text,
        TextType='text',
        VoiceId='Joanna'
    )

    key = "polly.mp3"

    file_name = os.path.join("/tmp", key)
    with open(file_name, "wb") as f:
        f.write(response["AudioStream"].read())

    s3_client = boto3.client("s3")
    _ = s3_client.upload_file(file_name, "thelastshow-hs", key)