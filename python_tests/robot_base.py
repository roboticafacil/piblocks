import threading

vl = 0
vr = 0
wheel_base = 1 #Distance in mm between

lock = threading.Lock()

def move_base(vel,omega):
	lock.acquire()
	vl=vel-wheel_base*omega
	vr=vel+wheel_base*omega
	set_vel(vl,vr)
	lock.release()

def forward(vel):
	lock.acquire()
	vl=vel
	vr=vel
	set_vel(vl,vr)
	lock.release()
	
def backward(vel):
	lock.acquire()
	vl=-vel
	vr=-vel
	set_vel(vl,vr)
	lock.release()

def turn_left(vel):
	lock.acquire()
	vl=-vel
	vr=vel
	set_vel(vl,vr)
	lock.release()
	
def turn_right(vel):
	lock.acquire()
	vl=vel
	vr=-vel
	set_vel(vl,vr)
	lock.release()

def stop():
	lock.acquire()
	vl=0
	vr=0
	set_vel(vl,vr)
	lock.release()

def pause():
	lock.acquire()
	set_vel(0,0)
	
def resume():
	set_vel(vl,vr)
	lock.release()
	
def set_vel(vl,vr):
	pass