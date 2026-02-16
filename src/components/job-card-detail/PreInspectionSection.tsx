import React, { useState, useRef } from 'react';
import { Camera, Plus, Loader2 } from 'lucide-react';
import { styles } from './styles';
import { Badge, Card } from './UIComponents';

interface PreInspectionSectionProps {
  preInspection: Record<string, any>;
  photos: any[];
  onUpload?: (file: File, category: string) => Promise<any>;
}

export const PreInspectionSection: React.FC<PreInspectionSectionProps> = ({ preInspection, photos, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>(photos || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    setUploading(true);
    try {
      const result = await onUpload(file, 'vehicle_photo');
      if (result) {
        setUploadedPhotos(prev => [...prev, result]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const checklistData = preInspection?.exterior ? preInspection : {
    exterior: [
      { item: 'Body condition', status: 'ok', note: 'No dents' },
      { item: 'Windshield', status: 'ok', note: 'No cracks' },
      { item: 'Paint scratches', status: 'warning', note: 'Left rear door, pre-existing' },
      { item: 'Headlights/Taillights', status: 'ok', note: 'Working' },
      { item: 'Tyres', status: 'ok', note: 'Adequate tread' },
    ],
    interior: [
      { item: 'Dashboard', status: 'ok', note: 'No warning lights (at entry)' },
      { item: 'AC', status: 'ok', note: 'Customer reports weak cooling' },
      { item: 'Seats & Upholstery', status: 'ok', note: 'Good condition' },
      { item: 'Spare wheel', status: 'ok', note: 'Present' },
    ],
    underHood: [
      { item: 'Engine oil level', status: 'ok', note: 'Low (to be topped up)' },
      { item: 'Coolant level', status: 'warning', note: 'Slightly below min mark' },
      { item: 'Battery terminals', status: 'ok', note: 'Clean' },
      { item: 'Brake fluid', status: 'ok', note: 'Adequate' },
    ],
  };

  return (
    <div style={{ padding: '0 32px 24px', background: styles.gray50, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Pre-Inspection Checklist */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📋 Pre-Inspection Checklist</span>
          <span style={{ fontSize: '12px', color: styles.gray500 }}>Completed by: Rajesh K. at 10:45 AM</span>
        </div>

        {Object.entries(checklistData).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: styles.gray500, textTransform: 'uppercase', marginBottom: '8px', marginTop: '12px' }}>
              {category === 'exterior' ? 'EXTERIOR' : category === 'interior' ? 'INTERIOR' : 'UNDER HOOD (Quick Check)'}
            </div>
            {(items as any[]).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', fontSize: '13px' }}>
                <span style={{ color: item.status === 'ok' ? styles.success : styles.warning }}>
                  {item.status === 'ok' ? '✅' : '⚠️'}
                </span>
                <span style={{ color: styles.gray700 }}>{item.item}</span>
                <span style={{ color: styles.gray400, fontStyle: item.status === 'warning' ? 'italic' : 'normal' }}>— {item.note}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>

      {/* Vehicle Photos */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: styles.gray800 }}>📸 Vehicle Documentation</span>
          <Badge variant="gray" size="sm">{4 + uploadedPhotos.length} Photos</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Front View', hasWarning: false },
            { label: 'Rear View', hasWarning: false },
            { label: 'Left Side - Scratch', hasWarning: true },
            { label: 'Odometer Reading', hasWarning: false },
          ].map((photo, idx) => (
            <div key={idx}>
              <div style={{
                aspectRatio: '4/3',
                background: styles.gray100,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: photo.hasWarning ? `2px solid ${styles.warning}` : `1px solid ${styles.gray200}`,
              }}>
                <Camera size={32} color={styles.gray400} />
              </div>
              <div style={{ fontSize: '11px', color: styles.gray500, textAlign: 'center', marginTop: '6px' }}>{photo.label}</div>
            </div>
          ))}
          
          {uploadedPhotos.map((photo, idx) => (
            <div key={`uploaded-${idx}`}>
              <div style={{
                aspectRatio: '4/3',
                background: styles.gray100,
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${styles.gray200}`,
              }}>
                <img 
                  src={photo.url || `/api/files/${photo.file_id}`}
                  alt={photo.original_name || `Photo ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '11px', color: styles.gray500, textAlign: 'center', marginTop: '6px' }}>
                {photo.original_name || `Uploaded Photo ${idx + 1}`}
              </div>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={handleUploadClick}
          disabled={uploading || uploadedPhotos.length >= 6}
          style={{
            width: '100%',
            padding: '12px',
            border: `2px dashed ${uploading ? styles.ekaOrange : styles.gray300}`,
            borderRadius: '8px',
            background: uploading ? styles.ekaOrangeLight : 'transparent',
            color: uploading ? styles.ekaOrange : styles.gray500,
            fontSize: '13px',
            cursor: uploading || uploadedPhotos.length >= 6 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 150ms ease',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...
            </>
          ) : (
            <>
              <Plus size={16} /> Upload More Photos
            </>
          )}
        </button>
        <div style={{ fontSize: '11px', color: styles.gray400, textAlign: 'center', marginTop: '8px' }}>
          Max 10 photos, 5MB each {uploadedPhotos.length > 0 && `(${uploadedPhotos.length} uploaded)`}
        </div>
      </Card>
    </div>
  );
};
