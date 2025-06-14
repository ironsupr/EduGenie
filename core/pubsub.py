# core/pubsub.py

from google.cloud import pubsub_v1
import json
import os

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")

publisher = pubsub_v1.PublisherClient()
subscriber = pubsub_v1.SubscriberClient()

def publish_message(topic_name: str, message: dict):
    topic_path = publisher.topic_path(PROJECT_ID, topic_name)
    data = json.dumps(message).encode("utf-8")
    future = publisher.publish(topic_path, data=data)
    return future.result()

def subscribe_to_topic(subscription_name: str, callback):
    subscription_path = subscriber.subscription_path(PROJECT_ID, subscription_name)
    subscriber.subscribe(subscription_path, callback=callback)
    print(f"Listening to {subscription_path}...")
