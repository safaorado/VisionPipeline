import { useState } from 'react'
import { analyzeImage } from './services/api'

export default function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [detections, setDetections] = useState([])
  const [explanation, setExplanation] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Stores original image dimensions to scale YOLO boxes responsively
  const [imgDims, setImgDims] = useState({ w: 1, h: 1 })

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setDetections([])
      setExplanation("")
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setExplanation("")
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await analyzeImage(formData)
      setDetections(response.data.detections)
      setExplanation(response.data.explanation)
    } catch (error) {
      console.error("API Error:", error)
      alert("Failed to analyze image. Check if backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-400">Vision Pipeline Gateway</h1>
          <p className="text-slate-400">YOLOv11 Nano + Mock VLM Analysis</p>
        </header>

        {/* Upload Controls */}
        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800 cursor-pointer"
          />
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full font-bold transition-colors shadow-lg"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* AI Summary Box */}
        {explanation && (
          <div className="bg-slate-800 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-md animate-fade-in">
            <h2 className="text-sm font-bold text-slate-400 mb-1">AI IMAGE SUMMARY</h2>
            <p className="text-blue-50 text-lg">{explanation}</p>
          </div>
        )}

        {/* Image & Bounding Box Visualizer */}
        {previewUrl && (
          <div className="relative inline-block border-2 border-slate-700 rounded-lg overflow-hidden bg-black shadow-2xl">
            <img 
              src={previewUrl} 
              alt="Upload preview" 
              className="max-h-[60vh] object-contain block"
              onLoad={(e) => setImgDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            />

            {/* Render YOLO Bounding Boxes */}
            {detections.map((det, index) => {
              const [x1, y1, x2, y2] = det.coordinates
              
              // Convert raw pixel coordinates to percentages
              const left = (x1 / imgDims.w) * 100
              const top = (y1 / imgDims.h) * 100
              const width = ((x2 - x1) / imgDims.w) * 100
              const height = ((y2 - y1) / imgDims.h) * 100

              return (
                <div 
                  key={index}
                  className="absolute border-2 border-orange-500 bg-orange-500/10 group hover:bg-orange-500/30 transition-colors cursor-crosshair"
                  style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
                >
                  {/* Label tag */}
                  <div className="absolute -top-6 left-[-2px] bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-t whitespace-nowrap z-10 shadow-md">
                    {det.object.toUpperCase()} {(det.confidence * 100).toFixed(0)}%
                  </div>
                  
                  {/* Mock VLM Action Tooltip (Shows on hover) */}
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-slate-800 text-blue-300 text-xs p-2 rounded shadow-xl whitespace-nowrap z-20 border border-slate-600">
                    {det.action}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}