from redis import Redis
from rq import Worker, Queue
import os
from app.config import REDIS_URL

print(REDIS_URL)
redis_conn = Redis.from_url(REDIS_URL)
queue = Queue(connection=redis_conn)
worker = Worker([queue], connection=redis_conn)

if __name__ == '__main__':
    worker.work()