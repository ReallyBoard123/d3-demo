import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisualizationWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultVisible?: boolean;
}

const VisualizationWrapper: React.FC<VisualizationWrapperProps> = ({
  title,
  children,
  className = "",
  defaultVisible = true,
}) => {
  const [isVisible, setIsVisible] = React.useState(defaultVisible);

  return (
    <Card className={`${className} transition-all duration-300 ${!isVisible ? 'opacity-60' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsVisible(!isVisible)}
          className="h-8 w-8"
        >
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className={`${!isVisible ? 'hidden' : ''}`}>
        {children}
      </CardContent>
    </Card>
  );
};

export default VisualizationWrapper;