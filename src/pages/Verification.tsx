import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

const Verification = () => {
  const { currentUser } = useStore();
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const docs = currentUser?.role === 'farmer'
    ? ['ID Proof', 'Farm Certificate']
    : ['ID Proof', 'Export License'];

  const handleUpload = (doc: string) => {
    setUploads(prev => ({ ...prev, [doc]: `${doc}_${Date.now()}.pdf` }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Verification</h1>
      <p className="text-muted-foreground">Upload required documents for account verification</p>
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          {currentUser?.verified ? (
            <><CheckCircle className="w-6 h-6 text-success" /><div><p className="font-semibold text-foreground">Verified</p><p className="text-sm text-muted-foreground">Your account is verified</p></div></>
          ) : submitted ? (
            <><Clock className="w-6 h-6 text-warning" /><div><p className="font-semibold text-foreground">Under Review</p><p className="text-sm text-muted-foreground">Documents submitted. Awaiting admin approval.</p></div></>
          ) : (
            <><XCircle className="w-6 h-6 text-destructive" /><div><p className="font-semibold text-foreground">Not Verified</p><p className="text-sm text-muted-foreground">Please upload required documents</p></div></>
          )}
        </div>
        {!submitted && !currentUser?.verified && (
          <>
            {docs.map(doc => (
              <div key={doc} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-foreground">{doc}</span>
                {uploads[doc] ? (
                  <span className="text-xs text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Uploaded</span>
                ) : (
                  <button onClick={() => handleUpload(doc)} className="flex items-center gap-1 text-sm text-primary hover:underline"><Upload className="w-3 h-3" /> Upload</button>
                )}
              </div>
            ))}
            <button onClick={() => setSubmitted(true)} disabled={Object.keys(uploads).length < docs.length} className={`w-full py-2.5 rounded-lg font-medium transition ${Object.keys(uploads).length >= docs.length ? 'gradient-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
              Submit for Verification
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Verification;
