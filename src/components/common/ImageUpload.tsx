import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  placeholder = "Upload image",
  className = "",
  size = 'md',
  shape = 'square',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-xl'
  };

  const handleFileSelect = async (file: File) => {
    if (!file || disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      // Convert file to base64 data URL for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
        setUploading(false);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} ${shapeClasses[shape]}
          border-2 border-dashed border-light-gray
          flex items-center justify-center
          cursor-pointer transition-all duration-200
          hover:border-royal-blue hover:bg-sky-blue hover:bg-opacity-5
          ${dragOver ? 'border-royal-blue bg-sky-blue bg-opacity-10' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${currentImage ? 'border-solid border-light-gray' : ''}
          overflow-hidden
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-royal-blue" />
        ) : currentImage ? (
          <img
            src={currentImage}
            alt="Uploaded"
            className={`w-full h-full object-cover ${shapeClasses[shape]}`}
          />
        ) : (
          <div className="text-center p-2">
            <ImageIcon className="h-6 w-6 text-charcoal-light mx-auto mb-1" />
            <p className="text-xs text-charcoal-light text-center leading-tight">{placeholder}</p>
          </div>
        )}
      </div>

      {currentImage && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeImage();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;