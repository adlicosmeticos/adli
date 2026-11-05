import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AboutSliderProps {
  images: string[];
}

export default function AboutSlider({ images }: AboutSliderProps) {
  const list = images && images.length > 0 ? images : ['/brand-editorial.webp'];
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play a cada 3 segundos
  useEffect(() => {
    if (list.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % list.length);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [list.length, current]);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % list.length);
  }

  function prevSlide() {
    setCurrent((prev) => (prev - 1 + list.length) % list.length);
  }

  // Touch Swipe para celular, tablet e ipad
  function handleTouchStart(e: React.TouchEvent) {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[500px] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Botanical decorative ring */}
      <div className="botanical-ring pointer-events-none absolute -left-4 -top-4 h-24 w-24 sm:-left-8 sm:-top-8 sm:h-36 sm:w-36 z-0" />

      {/* Main Image Slider Frame */}
      <div className="relative aspect-[4/4.25] w-full overflow-hidden rounded-2xl border border-[#DCC4BD] bg-[#ECDDD8]/40 shadow-md">
        {list.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={img}
              alt={`Galeria Quem Somos ${idx + 1}`}
              className="h-full w-full object-cover object-[70%_center]"
            />
          </div>
        ))}

        {/* Setas nos cantos para desktop / tablets */}
        {list.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#614331] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#966960] active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#614331] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#966960] active:scale-95"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots / Barrinhas indicadoras no rodapé da imagem */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-md">
              {list.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrent(dotIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`Ir para foto ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
