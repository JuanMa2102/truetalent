from redis import Redis
from rq import Worker, Queue
from app.config import REDIS_HOST, REDIS_PORT

redis_conn = Redis(host=REDIS_HOST, port=REDIS_PORT)
queue = Queue(connection=redis_conn)
worker = Worker([queue], connection=redis_conn)

if __name__ == '__main__':
    worker.work()