'use client';

import React from 'react';
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProcessMetadata } from '@/hooks/useProcessMetadata';
import { ProcessMetadata, WarehouseData, WarehouseFiles } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface FileUploaderProps {
  onDataLoaded: (data: WarehouseData) => void;
}

interface FileStatus {
  layout: boolean;
  processMetadata: boolean;
  warehouseData: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const { t } = useTranslation();
  const [files, setFiles] = React.useState<WarehouseFiles>({});
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { setProcessMetadata, setLayoutImage } = useProcessMetadata();

  const fileStatus = React.useMemo<FileStatus>(() => ({
    layout: !!files.layout,
    processMetadata: !!files.processMetadata,
    warehouseData: !!files.warehouseData
  }), [files.layout, files.processMetadata, files.warehouseData]);

  const areAllFilesUploaded = React.useMemo(() => 
    fileStatus.layout && fileStatus.processMetadata && fileStatus.warehouseData,
    [fileStatus]
  );

  const validateWarehouseData = (data: unknown): data is WarehouseData => {
    const d = data as WarehouseData;
    return !!(
      d &&
      d.metadata &&
      d.metadata.dateRange &&
      d.metadata.dateRange.start &&
      d.metadata.dateRange.end &&
      Array.isArray(d.records) &&
      d.records.length > 0
    );
  };

  const validateProcessMetadata = (data: unknown): data is ProcessMetadata => {
    const d = data as ProcessMetadata;
    return !!(
      d &&
      d.layout &&
      Array.isArray(d.layout.regions) &&
      Array.isArray(d.layout.region_labels) &&
      Array.isArray(d.human_activities)
    );
  };

  const handleFileProcess = async (file: File): Promise<boolean> => {
    try {
      // Handle PNG layout file
      if (file.type === 'image/png') {
        setFiles(prev => ({ ...prev, layout: file }));
        setLayoutImage(file);
        return true;
      }

      // Handle JSON files
      if (file.type === 'application/json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        // Check file content to determine type
        if ('records' in jsonData && validateWarehouseData(jsonData)) {
          setFiles(prev => ({ ...prev, warehouseData: jsonData }));
          return true;
        }

        if ('layout' in jsonData && validateProcessMetadata(jsonData)) {
          setFiles(prev => ({ ...prev, processMetadata: jsonData }));
          setProcessMetadata(jsonData);
          return true;
        }

        throw new Error('Invalid JSON file format');
      }

      return false;
    } catch (err) {
      throw new Error(`Error processing ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (const file of acceptedFiles) {
        await handleFileProcess(file);
        setUploadProgress(prev => prev + (100 / acceptedFiles.length));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  React.useEffect(() => {
    if (areAllFilesUploaded && files.warehouseData) {
      onDataLoaded(files.warehouseData);
    }
  }, [areAllFilesUploaded, files.warehouseData, onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const FileStatusIndicator: React.FC<{ name: string; isUploaded: boolean }> = ({ 
    name, 
    isUploaded 
  }) => (
    <div className="flex items-center gap-2">
      {isUploaded ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-gray-300" />
      )}
      <span className={cn(
        "text-sm",
        isUploaded ? "text-green-500" : "text-muted-foreground"
      )}>
        {name} {isUploaded && "(uploaded)"}
      </span>
    </div>
  );

  const clearFiles = () => {
    setFiles({});
    setError(null);
    setUploadProgress(0);
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {t('fileUploader.title')}
          {areAllFilesUploaded && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFiles}
            >
              {t('fileUploader.clearFiles')}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
            "hover:border-primary hover:bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mb-4 mx-auto text-muted-foreground" />
          <p className="text-lg mb-2">
            {isDragActive
              ? t('fileUploader.dropHere')
              : t('fileUploader.dragAndDrop')}
          </p>
          <div className="space-y-2 mt-4">
            <FileStatusIndicator 
              name={t('fileUploader.layoutImage')} 
              isUploaded={fileStatus.layout} 
            />
            <FileStatusIndicator 
              name={t('fileUploader.processMetadata')} 
              isUploaded={fileStatus.processMetadata} 
            />
            <FileStatusIndicator 
              name={t('fileUploader.warehouseActivity')} 
              isUploaded={fileStatus.warehouseData} 
            />
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center">
              {t('fileUploader.processing')}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => document.querySelector('input')?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('fileUploader.selectFiles')}
        </Button>

        {!areAllFilesUploaded && files.warehouseData && (
          <Alert className="mt-4">
            <AlertDescription>
              {t('fileUploader.uploadAllFiles')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;