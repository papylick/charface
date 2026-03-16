'use client'

export default function PageTransition({ animating }: { animating: boolean }) {
  return (
    <>
      <style>{`
        .page-flip-container {
          position: fixed;
          inset: 0;
          z-index: 9999;
          pointer-events: none;
          perspective: 1500px;
          transform-style: preserve-3d;
        }
        .page-flip-paper {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, #e8e0d0, #f5f0e8, #ede8dc);
          transform-origin: left center;
          transform: rotateY(0deg);
          transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1.000);
          box-shadow: -20px 0 60px rgba(0,0,0,0.5);
        }
        .page-flip-paper.flipping {
          transform: rotateY(-180deg);
        }
        .page-flip-lines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 32px,
            rgba(180,160,120,0.2) 32px,
            rgba(180,160,120,0.2) 33px
          );
        }
        .page-flip-margin {
          position: absolute;
          left: 80px; top: 0; bottom: 0;
          width: 1px;
          background: rgba(200,100,100,0.2);
        }
      `}</style>
      {animating && (
        <div className="page-flip-container">
          <div className={`page-flip-paper ${animating ? 'flipping' : ''}`}>
            <div className="page-flip-lines"/>
            <div className="page-flip-margin"/>
          </div>
        </div>
      )}
    </>
  )
}