from Camera import *
import cv2 as cv

#params.minThreshold = 10;
#params.maxThreshold = 200;
#params.filterByArea = True
#params.minArea = 1500
#params.filterByCircularity = True
#params.minCircularity = 0.1
#params.filterByConvexity = True
#params.minConvexity = 0.87
#params.filterByInertia = True
#params.minInertiaRatio = 0.01
#
blobDetector = Camera.blob_detector_create()

camera = Camera()
camera.start()
#video_writer=Camera.video_writer_create('output.avi','XDIV',20,640,480)
while True:
	image = Camera.read_image('blob.jpg',cv.IMREAD_COLOR)
	#image=Camera.read_frame()
	cv.imshow('image',image)
	camera.do(Camera.get_keypoints,image,blobDetector)
	camera.wait_for_results()
	keypoints = camera.get_results()
	image_with_keypoints = cv.drawKeypoints(image, keypoints, np.array([]), (0,0,255), cv.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
	cv.imshow('image with keypoints',image_with_keypoints)
	if cv.waitKey(1) & 0xFF == ord('q'):
		break

camera.stop()
print("Exiting Program")