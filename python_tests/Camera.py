import numpy as np
import cv2 as cv
import threading
import time

class Camera (threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self.result = threading.local()
		self.ev = threading.Event()
		self.stop_ev = threading.Event()
		self.do_processing=None
		self.args=None
		self.lock=threading.Lock()
		self.cap=cv.VideoCapture(0)
	def __del__(self):
		self.cap.release()
		
	def run(self):
		#print("Starting camera capturing")
		while not self.stop_ev.is_set():
			self.ev.wait()
			if not self.stop_ev.is_set():
				self.lock.acquire()
				if len(self.args)>0:
					self.results=self.do_processing(*self.args)
				else:
					self.results=self.do_processing()
				self.ev.clear()
				self.lock.release()
		#print("Releasing camera capture")
	def do(self,function,*args):
		self.do_processing=function
		self.args=args
		self.ev.set()
	def is_processing_finished(self):
		return ~self.ev.is_set()
	def wait_for_results(self):
		while self.ev.is_set():
			time.sleep(0)
	def get_results(self):
		return self.results
	def stop(self):
		self.ev.set()
		self.stop_ev.set()	

	def pause(self):
		self.lock.acquire()
		
	def resume(self):
		self.lock.release()
		
	def read_frame(self):
		ret,frame = self.cap.read()
		return frame

	@staticmethod
	def read_image(filename,mode=cv.IMREAD_COLOR):
		return cv.imread(filename,mode)
		
	@staticmethod
	def write_image(image,filename):
		cv.imwrite(filename,image)
		
	@staticmethod
	def get_pixel(image,px,py):
		return image[px,py]

	@staticmethod
	def get_pixel_channel(image,px,py,channel=0):
		return image[px,py,channel]
		
	@staticmethod
	def get_pixels(image,ROI)
		return image[ROI.topx:(ROI.topx+ROI.width),ROI.topy:(ROI.topy+ROI.height)]
	
	@staticmethod
	def set_pixels(image,sub_image,ROI)
		return image[ROI.topx:(ROI.topx+ROI.width),ROI.topy:(ROI.topy+ROI.height)]=sub_image

	@staticmethod
	def video_writer_create(filename,cc,fps,width,height):
		fourcc = cv.VideoWriter_fourcc(*cc)
		return cv.VideoWriter(filename,fourcc,fps,(width,height))
	
	@staticmethod
	def add_video_frame(video_writer,frame):
		video_writer.write(frame)

	@staticmethod
	def convert_image(image,mode=cv.COLOR_BGR2GRAY):
		return cv.cvtColor(image,mode)
		
	@staticmethod
	def get_keypoints(image,blobDetector):
		keypoints = blobDetector.detect(image)
		print("Image processed: "+time.ctime(time.time()))
		return keypoints

	@staticmethod
	def blob_detector_create(minThreshold=10,maxThreshold=200,filterByArea=True,minArea=1500,filterByCircularity=True,minCircularity=0.1,filterByConvexity=True,minConvexity=0.87,filterByInertia=True,minInertiaRatio=0.01):
		params = cv.SimpleBlobDetector_Params()
		params.minThreshold = minThreshold;
		params.maxThreshold = maxThreshold;
		params.filterByArea = filterByArea
		params.minArea = minArea
		params.filterByCircularity = filterByCircularity
		params.minCircularity = minCircularity
		params.filterByConvexity = filterByConvexity
		params.minConvexity = minConvexity
		params.filterByInertia = filterByInertia
		params.minInertiaRatio = minInertiaRatio
		blobDetector = cv.SimpleBlobDetector_create(params)
		return blobDetector