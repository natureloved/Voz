import * as React from 'react';
import { motion } from 'framer-motion';

export function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const [dataArray, setDataArray] = React.useState<Uint8Array | null>(null);
  const animationRef = React.useRef<number>();

  React.useEffect(() => {
    if (!analyser) return;

    const array = new Uint8Array(analyser.frequencyBinCount);
    
    const update = () => {
      analyser.getByteFrequencyData(array);
      setDataArray(new Uint8Array(array));
      animationRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser]);

  const numBars = 6;
  const bars = Array.from({ length: numBars }).map((_, i) => {
    if (!dataArray) return 10;
    const sliceSize = Math.floor((dataArray.length / 2) / numBars); // focus on lower frequencies
    const start = i * sliceSize;
    let sum = 0;
    for (let j = start; j < start + sliceSize; j++) {
      sum += dataArray[j];
    }
    const avg = sum / sliceSize;
    return Math.max(10, (avg / 255) * 40); 
  });

  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          animate={{ height }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-1.5 bg-cream rounded-full"
        />
      ))}
    </div>
  );
}
