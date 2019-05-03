import subprocess
import os
import signal
import time
import sys
import psutil
import threading

#def check_output(process):
#	output = process.stdout.readline()
#	rc = proc.poll()
#	return output
	
def output_reader(proc):
	for line in iter(proc.stdout.readline, b''):
		print("From main script: %s" % line.strip().decode('utf-8'))
	
to_run=['python','another.py']
proc = subprocess.Popen(to_run,creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)#,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
print("start process with pid %s" % proc.pid)
psProcess=psutil.Process(pid=proc.pid)

#t = threading.Thread(target=output_reader, args=(proc,))
#t.start()
time.sleep(3)
#start_time = time.time()
#while True:
#	elapsed_time = time.time() - start_time
#	if elapsed_time>=5:
#		break
#	output=check_output(proc)
#	if output:
#		print("From main script: %s" % output.strip().decode("utf-8"))

print("Let's make a break")
psProcess.suspend()
time.sleep(2)
print("Let's continue!")
psProcess.resume()
time.sleep(3)
#start_time = time.time()
#while True:
#	elapsed_time = time.time() - start_time
#	if elapsed_time>=10:
#		break
#	output=check_output(proc)
#	if output:
#		print("From main script: %s" % output.strip().decode("utf-8"))

if proc.poll() is None:
	print("Sending a break signal to process %s with pid %s " % (to_run,proc.pid))
	#proc.kill()
	#proc.terminate()
	#os.kill(proc.pid,signal.SIGTERM)
	#proc.send_signal(signal.SIGTERM)
	proc.send_signal(signal.CTRL_BREAK_EVENT)
	time.sleep(2)
	print("Killing the process %s with pid %s " % (to_run,proc.pid))
	proc.kill()
	
time.sleep(2) ##Let the child process to terminate cleanly