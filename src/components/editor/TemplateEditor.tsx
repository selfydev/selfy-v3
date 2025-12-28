'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, FabricObject, FabricText, FabricImage, Rect, Circle } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle as CircleIcon,
  Trash2,
  Download,
  Save,
  Loader2,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface CanvasData {
  background?: string;
  objects?: Array<{
    type: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface TemplateEditorProps {
  bookingId: string;
  initialData?: CanvasData;
  onSave?: (canvasData: CanvasData, thumbnailBase64: string) => Promise<void>;
}

// Canvas dimensions (4:3 aspect ratio for photo booth)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export function TemplateEditor({ bookingId, initialData, onSave }: TemplateEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize canvas
  useEffect(() => {
    // Safety timeout to force canvas ready if loading takes too long
    const safetyTimeout = setTimeout(() => {
      console.warn('Canvas loading timeout - forcing ready state');
      setIsCanvasReady(true);
    }, 3000);

    // Wait for next tick to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (!canvasRef.current || fabricRef.current) return;

      try {
        const canvas = new Canvas(canvasRef.current, {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: '#ffffff',
          selection: true,
          enableRetinaScaling: false, // CRITICAL: Disable retina scaling
        });

        fabricRef.current = canvas;

        // Selection events
        canvas.on('selection:created', (e) => {
          setSelectedObject(e.selected?.[0] || null);
        });

        canvas.on('selection:updated', (e) => {
          setSelectedObject(e.selected?.[0] || null);
        });

        canvas.on('selection:cleared', () => {
          setSelectedObject(null);
        });

        // Save to history on object modification
        canvas.on('object:modified', () => {
          saveToHistory();
        });

        // Load initial data if provided
        if (initialData && typeof initialData === 'object') {
          console.log('Loading template data...', { hasBackground: !!initialData.background, objectCount: initialData.objects?.length });

          // Set background first
          if (initialData.background) {
            canvas.backgroundColor = initialData.background;
          }

          // Load objects manually using Fabric.js classes
          try {
            console.log('Creating objects manually from template data...');

            if (initialData.objects && Array.isArray(initialData.objects)) {
              initialData.objects.forEach((objData: any) => {
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
                  console.log('Added object:', objData.type, 'at', objData.left, objData.top);
                }
              });
            }

            const objects = canvas.getObjects();
            console.log('Template loaded successfully!');
            console.log('- Canvas size:', canvas.width, 'x', canvas.height);
            console.log('- Objects on canvas:', objects.length);
            console.log('- Background:', canvas.backgroundColor);

            // Log each object's position for debugging
            objects.forEach((obj, index) => {
              const bounds = obj.getBoundingRect();
              console.log(`  Object ${index}:`, {
                type: obj.type,
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height,
                actualBounds: bounds,
                visible: obj.visible,
                opacity: obj.opacity,
              });
            });

            // Force a render
            canvas.renderAll();
            canvas.requestRenderAll();
            canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
            canvas.requestRenderAll();

            // Log final canvas state
            setTimeout(() => {
              console.log('Final canvas state:');
              console.log('- Canvas element:', canvasRef.current);
              console.log('- Canvas context:', canvas.getContext());
              console.log('- Zoom:', canvas.getZoom());
              console.log('- ViewportTransform:', canvas.viewportTransform);
            }, 200);

            // Add a small delay to ensure everything is rendered
            setTimeout(() => {
              clearTimeout(safetyTimeout);
              setIsCanvasReady(true);
              saveToHistory();
            }, 100);
          } catch (error: any) {
            console.error('Error creating objects:', error);
            clearTimeout(safetyTimeout);
            setIsCanvasReady(true);
            saveToHistory();
          }
        } else {
          console.log('No initial data, starting with blank canvas');
          clearTimeout(safetyTimeout);
          canvas.renderAll();
          canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
          canvas.requestRenderAll();
          setIsCanvasReady(true);
          saveToHistory();
        }
      } catch (error) {
        console.error('Failed to initialize canvas:', error);
        clearTimeout(safetyTimeout);
        setIsCanvasReady(true); // Set ready even on error to show UI
      }
    }, 150);

    return () => {
      clearTimeout(safetyTimeout);
      clearTimeout(initTimer);
      if (fabricRef.current) {
        try {
          fabricRef.current.dispose();
        } catch (e) {
          console.warn('Error disposing canvas:', e);
        }
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  // Add text
  const addText = useCallback(() => {
    if (!fabricRef.current) return;
    const text = new FabricText('Double click to edit', {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      fontFamily: 'Arial',
      fontSize: 32,
      fill: '#000000',
      originX: 'center',
      originY: 'center',
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  // Add rectangle
  const addRectangle = useCallback(() => {
    if (!fabricRef.current) return;
    const rect = new Rect({
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      width: 150,
      height: 100,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
    });
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  // Add circle
  const addCircle = useCallback(() => {
    if (!fabricRef.current) return;
    const circle = new Circle({
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      radius: 50,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
    });
    fabricRef.current.add(circle);
    fabricRef.current.setActiveObject(circle);
    fabricRef.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  // Add image from file
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      FabricImage.fromURL(dataUrl).then((img) => {
        // Scale image to fit canvas
        const scale = Math.min(
          (CANVAS_WIDTH * 0.5) / (img.width || 1),
          (CANVAS_HEIGHT * 0.5) / (img.height || 1)
        );
        img.scale(scale);
        img.set({
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          originX: 'center',
          originY: 'center',
        });
        fabricRef.current?.add(img);
        fabricRef.current?.setActiveObject(img);
        fabricRef.current?.renderAll();
        saveToHistory();
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [saveToHistory]);

  // Delete selected object
  const deleteSelected = useCallback(() => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.remove(selectedObject);
    setSelectedObject(null);
    saveToHistory();
  }, [selectedObject, saveToHistory]);

  // Zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoom + 0.1, 2) : Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);
    if (fabricRef.current) {
      fabricRef.current.setZoom(newZoom);
      fabricRef.current.renderAll();
    }
  }, [zoom]);

  // Export as PNG
  const exportAsPng = useCallback(() => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // 2x resolution
    });
    const link = document.createElement('a');
    link.download = `template-${bookingId}.png`;
    link.href = dataUrl;
    link.click();
  }, [bookingId]);

  // Save template
  const handleSave = useCallback(async () => {
    if (!fabricRef.current || !onSave) return;
    
    setIsSaving(true);
    try {
      const canvasData = fabricRef.current.toJSON();
      const thumbnailBase64 = fabricRef.current.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.5, // Smaller for thumbnail
      });
      await onSave(canvasData, thumbnailBase64);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
          {/* Add Elements */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={addText}>
                  <Type className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add text - Click to add editable text</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={addRectangle}>
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add rectangle - Create a rectangular shape</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={addCircle}>
                  <CircleIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add circle - Create a circular shape</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add image - Upload a logo or image</TooltipContent>
            </Tooltip>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* History */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo - Revert last change</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo - Restore undone change</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom('out')}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out - Decrease canvas size</TooltipContent>
            </Tooltip>

            <span className="min-w-[3rem] text-center text-sm text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom('in')}
                  disabled={zoom >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in - Increase canvas size</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelected}
                disabled={!selectedObject}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete - Remove selected element</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Export & Save */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={exportAsPng}>
                <Download className="mr-2 h-4 w-4" />
                Export PNG
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download template as PNG image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Template
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save your template to this booking</TooltipContent>
          </Tooltip>
        </div>

      {/* Canvas Container */}
      <div className="flex gap-4">
        {/* Main Canvas - SCROLLABLE */}
        <div className="flex-1 rounded-lg border bg-muted/30 p-4 overflow-auto">
          <div className="flex items-center justify-center" style={{ minHeight: '640px', minWidth: '840px' }}>
            <div
              className="rounded border bg-white shadow-sm"
              style={{
                width: '800px',
                height: '600px',
                position: 'relative',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  display: 'block',
                  width: '800px',
                  height: '600px',
                }}
              />
              {!isCanvasReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading editor...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedObject && (
          <div className="w-64 space-y-4 rounded-lg border bg-card p-4">
            <h3 className="font-semibold">Properties</h3>
            <Separator />
            
            {selectedObject.type === 'text' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={(selectedObject as FabricText).fontSize || 32}
                    onChange={(e) => {
                      (selectedObject as FabricText).set('fontSize', parseInt(e.target.value));
                      fabricRef.current?.renderAll();
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="textColor">Color</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={(selectedObject as FabricText).fill as string || '#000000'}
                    onChange={(e) => {
                      (selectedObject as FabricText).set('fill', e.target.value);
                      fabricRef.current?.renderAll();
                    }}
                  />
                </div>
              </div>
            )}

            {(selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="strokeColor">Border Color</Label>
                  <Input
                    id="strokeColor"
                    type="color"
                    value={selectedObject.stroke as string || '#000000'}
                    onChange={(e) => {
                      selectedObject.set('stroke', e.target.value);
                      fabricRef.current?.renderAll();
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="strokeWidth">Border Width</Label>
                  <Input
                    id="strokeWidth"
                    type="number"
                    value={selectedObject.strokeWidth || 1}
                    onChange={(e) => {
                      selectedObject.set('strokeWidth', parseInt(e.target.value));
                      fabricRef.current?.renderAll();
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fillColor">Fill Color</Label>
                  <Input
                    id="fillColor"
                    type="color"
                    value={selectedObject.fill as string || '#ffffff'}
                    onChange={(e) => {
                      selectedObject.set('fill', e.target.value);
                      fabricRef.current?.renderAll();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Instructions */}
        <p className="text-center text-sm text-muted-foreground">
          Click on elements to select them. Drag to move. Use corner handles to resize.
          Double-click text to edit.
        </p>
      </div>
    </TooltipProvider>
  );
}

