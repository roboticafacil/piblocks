#!/usr/bin/python

import threading
import time

class myThread (threading.Thread):
	def __init__(self, name):
		threading.Thread.__init__(self)
		self.results = threading.local()
		self.name = name
		self.ev = threading.Event()
		self.stop = threading.Event()
	def run(self):
		print("Starting " + self.name)
		while not self.stop.is_set():
			self.ev.wait()
			if not self.stop.is_set():
				self.do_something()
				time.sleep(5) #This is the time that the process takes in doing something, i.e.: displaying images, processing images, etc.
				self.update_result()
				self.ev.clear()
		print("Exiting " + self.name)
	def do_task_in_background(self):
		self.ev.set()
	def is_task_finished(self):
		return ~self.ev.is_set()
	def wait_for_results(self):
		while self.ev.is_set():
			time.sleep(0)
	def get_results(self):
		return self.results
	def stop_thread(self):
		self.ev.set()
		self.stop.set()
	def do_something(self):
		print("%s: %s" % (self.name, time.ctime(time.time())))
	def update_result(self):
		self.results=time.ctime(time.time())

# Create new threads
thread1 = myThread("Thread-1")
thread2 = myThread("Thread-2")
# Start new Threads
thread1.start()
thread2.start()

print("I'm here")
thread1.do_task_in_background()
thread2.do_task_in_background()
time.sleep(15) #This is a time for other things doing something
print("Result for Thread-1" +thread1.get_results())
print("Result for Thread-2" +thread2.get_results())
if thread1.is_task_finished():
	print("Now, I'm here")
	thread1.do_task_in_background()
	time.sleep(1) #This is a time for other things doing something
	print("Result for Thread-1 (the thread hasn't finished yet)" +thread1.get_results()) #Here since the process hasn't finished yet, the result should be the same as before
print("Waiting for results")
thread1.wait_for_results()
print("Result for Thread-1 (now is finished)" +thread1.get_results()) #Now, it should be OK
print("Now I'm ready!")
if thread1.is_task_finished():
	print("Now, I'm doing something else again")
	thread1.do_task_in_background()
if thread2.is_task_finished():
	thread2.do_task_in_background()
time.sleep(10) #This is a time for other things doing something

thread1.stop_thread()
thread2.stop_thread()
print("Result for Thread-1" +thread1.get_results())
print("Result for Thread-2" +thread2.get_results())

print("Exiting Main Thread")