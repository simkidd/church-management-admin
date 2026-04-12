"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

const CertificateViewer = ({ url }: { url: string }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}
      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=Fit&page=1`}
        className="w-full h-[70vh] border-0 bg-transparent"
        title="Certificate PDF"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default CertificateViewer;
