'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, FabricText } from 'fabric';
import { Loader2 } from 'lucide-react';

interface TemplatePreviewProps {
  canvasData: any;
  width?: number;
  height?: number;
  className?: string;
}

export function TemplatePreview({
  canvasData,
  width = 200,
  height = 150,
  className = ''
}: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !canvasData) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Clean up previous canvas if it exists
    if (fabricRef.current) {
      try {
        fabricRef.current.dispose();
      } catch (e) {
        console.warn('Error disposing canvas:', e);
      }
      fabricRef.current = null;
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!canvasRef.current) return;

      try {
        // Create a new canvas
        const canvas = new Canvas(canvasRef.current, {
          width,
          height,
          selection: false,
          renderOnAddRemove: true,
          backgroundColor: canvasData.background || '#ffffff',
          enableRetinaScaling: false, // CRITICAL: Disable retina scaling
        });

        fabricRef.current = canvas;

        // Set background if provided
        if (canvasData.background) {
          canvas.backgroundColor = canvasData.background;
        }

        // Create objects manually
        try {
          if (canvasData.objects && Array.isArray(canvasData.objects)) {
            canvasData.objects.forEach((objData: any) => {
              let fabricObject = null;

              if (objData.type === 'Rect' || objData.type === 'rect') {
                fabricObject = new Rect({
                  left: objData.left,
                  top: objData.top,
                  width: objData.width,
                  height: objData.height,
                  fill: objData.fill || 'transparent',
                  stroke: objData.stroke,
                  strokeWidth: objData.strokeWidth,
                  rx: objData.rx,
                  ry: objData.ry,
                  originX: 'left',
                  originY: 'top',
                });
              } else if (objData.type === 'Text' || objData.type === 'text') {
                const textOptions: any = {
                  left: objData.left,
                  top: objData.top,
                  fontSize: objData.fontSize,
                  fontFamily: objData.fontFamily,
                  fill: objData.fill,
                };

                if (objData.fontWeight) textOptions.fontWeight = objData.fontWeight;
                if (objData.fontStyle) textOptions.fontStyle = objData.fontStyle;

                fabricObject = new FabricText(objData.text || '', textOptions);
              }

              if (fabricObject) {
                canvas.add(fabricObject);
              }
            });
          }

          // Since the canvas is created at preview size (200x150),
          // we need to scale objects down from 800x600
          const scaleX = width / 800;
          const scaleY = height / 600;
          const scale = Math.min(scaleX, scaleY);

          // Scale all objects to fit preview
          canvas.getObjects().forEach(obj => {
            obj.scaleX = (obj.scaleX || 1) * scale;
            obj.scaleY = (obj.scaleY || 1) * scale;
            obj.left = (obj.left || 0) * scale;
            obj.top = (obj.top || 0) * scale;
            obj.setCoords();
          });

          canvas.renderAll();
          canvas.requestRenderAll();
          canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
          canvas.requestRenderAll();
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to render template preview:', error);
          setHasError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to create canvas:', error);
        setHasError(true);
        setIsLoading(false);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (fabricRef.current) {
        try {
          fabricRef.current.dispose();
        } catch (e) {
          console.warn('Error disposing canvas on cleanup:', e);
        }
        fabricRef.current = null;
      }
    };
  }, [canvasData, width, height]);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs text-muted-foreground">Preview unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={className}
        style={{ maxWidth: '100%', height: 'auto', display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}
