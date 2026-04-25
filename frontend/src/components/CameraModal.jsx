import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Erro ao acessar câmera:", err);
          alert("Não foi possível acessar sua câmera. Verifique as permissões do navegador.");
          onClose();
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Desenha o frame do vídeo no canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Converte para Base64 (JPEG, qualidade 80%) para não ficar muito pesado
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(dataUrl);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(26,26,36,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}><Camera size={20}/> Câmera Web</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='var(--text-muted)'}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)', background: '#000', boxShadow: '0 0 20px rgba(138,43,226,0.3)' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '480px', height: '360px', objectFit: 'cover', display: 'block' }} />
        </div>
        
        <button onClick={handleCapture} className="btn-primary" style={{ marginTop: '25px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', padding: '15px' }}>
          <Camera size={22} /> Tirar Foto Agora
        </button>
      </div>
    </div>
  );
}
