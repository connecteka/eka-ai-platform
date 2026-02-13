import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  width = 400,
  height = 150,
  penColor = '#374151',
  backgroundColor = '#FFFFFF',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }, [width, height, backgroundColor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    setHasSignature(false);
    onClear?.();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          border: '2px dashed #D1D5DB',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#F9FAFB',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            cursor: 'crosshair',
            touchAction: 'none',
            display: 'block',
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={clearCanvas}
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#6B7280',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
        >
          Clear
        </button>
        
        <button
          onClick={saveSignature}
          disabled={!hasSignature}
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 500,
            color: hasSignature ? '#FFFFFF' : '#9CA3AF',
            backgroundColor: hasSignature ? '#E8952F' : '#E5E7EB',
            border: 'none',
            borderRadius: '8px',
            cursor: hasSignature ? 'pointer' : 'not-allowed',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (hasSignature) {
              e.currentTarget.style.backgroundColor = '#CC7A1A';
            }
          }}
          onMouseLeave={(e) => {
            if (hasSignature) {
              e.currentTarget.style.backgroundColor = '#E8952F';
            }
          }}
        >
          Save Signature
        </button>
      </div>
      
      <p style={{
        fontSize: '11px',
        color: '#9CA3AF',
        textAlign: 'center',
        margin: 0,
      }}>
        Sign above using your mouse or finger
      </p>
    </div>
  );
};

export default SignaturePad;
