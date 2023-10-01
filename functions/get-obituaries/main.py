# add your get-obituaries function here
import boto3

def get_sorted_items():
    dynamodb_resource = boto3.resource("dynamodb")
    data_table = dynamodb_resource.Table("thelastshow-30140813")

    response = data_table.scan()
    items = response["Items"]
    
    while 'LastEvaluatedKey' in response:
        response = data_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])

    return sorted(items, key=lambda x: x["creation"])

def lambda_handler(event, context):
    sorted_items = get_sorted_items()
    return sorted_items
