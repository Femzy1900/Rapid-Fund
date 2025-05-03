
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  existingImageUrl?: string;
}

const ImageUpload = ({ onImageUploaded, existingImageUrl }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);
  const { user } = useAuth();
  
  const uploadImage = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload images');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a unique file path
      const filePath = `campaign-images/${user.id}/${new Date().getTime()}-${file.name}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(filePath);
        
      setPreviewUrl(publicUrlData.publicUrl);
      onImageUploaded(publicUrlData.publicUrl);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    // Create a temporary preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Upload the file
    uploadImage(file);
    
    // Clean up the temporary preview URL
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };
  
  return (
    <div className="space-y-4">
      <Label htmlFor="campaignImage">Campaign Image</Label>
      
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Campaign preview" 
            className="w-full h-64 object-cover rounded-lg" 
          />
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
            ) : (
              <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            )}
            <span className="text-sm text-gray-600 mb-1">
              {isUploading ? 'Uploading...' : 'Click to upload an image'}
            </span>
            <span className="text-xs text-gray-500">
              JPG, PNG, GIF up to 5MB
            </span>
            <Input 
              id="image-upload"
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
