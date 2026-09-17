from fastapi import FastAPI, UploadFile, File, Security, HTTPException, Depends
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import os
from dotenv import load_dotenv
from collections import defaultdict


load_dotenv()

app = FastAPI(title="Local YOLO-VLM Gateway")

#CORS Configuration 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Security Configuration
API_KEY_NAME = "X-API-Key"
SECRET_API_KEY = os.getenv("GATEWAY_API_KEY")
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == SECRET_API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=401,
        detail="Missing or invalid API key"
    )

# Load Optimized YOLO Model
print("Loading hardware-accelerated YOLOv11 Nano ONNX model...")
yolo_model = YOLO("yolo11n.onnx") 

#Main API Endpoint
@app.post("/api/analyze", dependencies=[Depends(get_api_key)])
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image.")

        results = []
        detected_objects_summary = defaultdict(list)
        
        yolo_detections = yolo_model(img)
        
        for box in yolo_detections[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            class_name = yolo_model.names[int(box.cls[0])]
            confidence = round(float(box.conf[0]), 2)
            
            # Group for summary
            detected_objects_summary[class_name].append(confidence)
            
            # Crop for future VLM usage
            cropped_img = img[y1:y2, x1:x2]
            _, buffer = cv2.imencode('.jpg', cropped_img)
            base64_crop = base64.b64encode(buffer).decode('utf-8')
            
            mock_action = f"VLM would describe this {class_name} crop here."
            
            results.append({
                "object": class_name,
                "confidence": confidence,
                "coordinates": [x1, y1, x2, y2],
                "action": mock_action
            })
            
        # Generate the Overall Explanation
        if not detected_objects_summary:
            overall_explanation = "No recognizable objects were detected in this image."
        else:
            summary_parts = []
            for obj_name, conf_list in detected_objects_summary.items():
                pct_strings = [f"{int(c * 100)}%" for c in conf_list]
                
                if len(conf_list) == 1:
                    summary_parts.append(f"1 {obj_name} ({pct_strings[0]})")
                else:
                    summary_parts.append(f"{len(conf_list)} {obj_name}s ({', '.join(pct_strings)})")
            
            overall_explanation = f"Analysis complete. The image contains: {', '.join(summary_parts)}."

        return {
            "status": "success", 
            "explanation": overall_explanation,
            "detections": results
        }

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server processing error: {str(e)}")
