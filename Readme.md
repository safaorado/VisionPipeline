Vision Pipeline Gateway

This project is a full-stack, hardware-accelerated computer vision application designed to detect objects in images and generate dynamic AI-driven summaries. Built with a React and Vite frontend and a FastAPI backend, it serves as a lightweight gateway for integrating rapid object detection with Vision-Language Models (VLMs).

Core Capabilities

Hardware-Accelerated Inference: Utilizes YOLOv11 Nano exported to ONNX format, allowing near-instantaneous object detection (50–200ms) on standard CPUs without requiring massive, dedicated GPU drivers.

Dynamic Aggregation: The backend groups identical detected objects, calculates confidence percentages, and returns a natural-language summary of the image contents.

VLM Pipeline Preparation: Automatically calculates spatial crop coordinates for detected objects and converts them into Base64 strings, preparing the isolated images for downstream processing by advanced Vision-Language Models.

System Constraints

Model Accuracy vs. Speed: As the smallest model in the YOLOv11 family (~5.6 MB), the Nano variant prioritizes speed and low memory consumption over absolute accuracy. It may struggle to detect highly occluded objects or tiny background elements compared to larger, heavier models.

Runtime Dependencies: The backend strictly requires the onnxruntime engine to execute the optimized model. Running the application without it will result in critical server errors.

Media Limitations: While highly optimized for static image processing, attempting to process high-framerate video streams on standard CPU hardware will cause significant processing bottlenecks and frame drops.