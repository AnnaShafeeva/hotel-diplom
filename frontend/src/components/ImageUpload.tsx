import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import { AddPhotoAlternate, Delete } from '@mui/icons-material';

interface ImageFile {
  file: File;
  preview: string;
}

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 10
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`Максимум ${maxImages} фотографий`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(`Можно добавить только ${availableSlots} из ${files.length} файлов`);
    }

    let processedCount = 0;

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Можно загружать только изображения');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Размер файла не должен превышать 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageFile: ImageFile = {
          file,
          preview: e.target?.result as string
        };
        newImages.push(imageFile);
        processedCount++;

        if (processedCount === filesToProcess.length) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onImagesChange(updatedImages.map(img => img.file));
          setError('');
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
    setError('');
  };

  const canAddMore = images.length < maxImages;
  const availableSlots = maxImages - images.length;

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Фотографии номера
          </Typography>
          <Typography
            variant="body2"
            color={canAddMore ? "text.secondary" : "error.main"}
            fontWeight="medium"
          >
            {images.length} / {maxImages}
            {!canAddMore && " - лимит достигнут"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternate />}
          onClick={() => fileInputRef.current?.click()}
          disabled={!canAddMore}
          fullWidth
        >
          {canAddMore ? `Добавить фотографии (доступно ${availableSlots})` : 'Лимит фотографий достигнут'}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Максимум {maxImages} фото. Форматы: JPG, PNG, WebP. Макс. размер: 10MB
        </Typography>
      </Paper>

      {images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper
                variant="outlined"
                sx={{
                  position: 'relative',
                  padding: 1,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  component="img"
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload;