
import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { generateEditedImage } from '../services/geminiService';
import { Upload, Wand2, RefreshCcw, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import { User } from '../types';

interface ImageEditorViewProps {
  currentUser: User;
}

export const ImageEditorView: React.FC<ImageEditorViewProps> = ({ currentUser }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setGeneratedImage(null);
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !prompt.trim()) {
      setError('Please select an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedImage(null);

    try {
      const result = await generateEditedImage(selectedFile, prompt);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while communicating with the AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `obt-edited-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="pb-20 animate-pop">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg mb-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <h2 className="text-xl font-bold">AI Image Studio</h2>
          </div>
          <p className="text-white/80 text-sm">Powered by Gemini 2.5 Flash Image</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform -translate-x-5 translate-y-5"></div>
      </div>

      <div className="space-y-6">
        
        {/* Input Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
              previewUrl ? 'border-mint-300 bg-mint-50/30' : 'border-gray-200 hover:border-mint-400 hover:bg-gray-50'
            }`}
          >
            {previewUrl ? (
              <div className="relative w-full aspect-video md:aspect-square max-h-64 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-sm object-contain" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                  <p className="text-white font-medium flex items-center gap-2"><RefreshCcw className="w-4 h-4"/> Change Image</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-mint-100 p-3 rounded-full mb-3 text-mint-600">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700">Tap to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          {/* Prompt Input */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Magic Prompt</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Add a retro filter, Remove the background, Make it look like a sketch..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mint-500 min-h-[80px] text-sm resize-none"
              />
              <Wand2 className="absolute right-3 bottom-3 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !selectedFile || !prompt.trim()}
            className="w-full mt-4 bg-gray-900 hover:bg-black text-white"
          >
            {isLoading ? 'Processing Magic...' : 'Generate Edit'}
          </Button>
        </div>

        {/* Results Section */}
        {generatedImage && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-mint-600" /> Result
              </h3>
              <button 
                onClick={handleDownload}
                className="text-xs font-bold text-mint-600 flex items-center gap-1 hover:underline"
              >
                <Download className="w-3 h-3" /> Save
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              <img src={generatedImage} alt="Generated" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
