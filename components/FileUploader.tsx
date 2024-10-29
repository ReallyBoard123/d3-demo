"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { WarehouseData } from '@/types/warehouse';

interface FileUploaderProps {
  onDataLoaded: (data: WarehouseData) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        setError("Please upload a JSON file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string) as WarehouseData;
          if (!jsonData.metadata || !jsonData.records) {
            throw new Error("Invalid data format");
          }
          onDataLoaded(jsonData);
          setError(null);
        } catch (err) {
          setError(`Error parsing JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      };
      reader.onerror = () => {
        setError("Error reading file");
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>Upload Warehouse Activity Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <Button 
            variant="outline" 
            className="w-full max-w-xs" 
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select JSON File
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;