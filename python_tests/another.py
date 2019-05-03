import time
import sys
import signal

def termination_handler(signum, frame):
	print("Terminating!")
	sys.stdout.flush()
	sys.exit(0)

signal.signal(signal.SIGBREAK, termination_handler)
#signal.signal(signal.SIGTERM, termination_handler)


while True:
	print("Hello")
	sys.stdout.flush()
	time.sleep(2)