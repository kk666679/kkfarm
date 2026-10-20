const BRANDS = [
  'APPTESTIFY', 'NOVA LABS', 'ORBIT QA', 'PIXELFORGE',
  'HYPERION', 'SOUTHBOUND', 'VERTEX MOBILE', 'BLUEPEAK',
];

export default function Trust() {
  // Duplicate for seamless loop
  const items = [...BRANDS, ...BRANDS];

  return (
    <div className="trust">
      <div className="trust-label">Powering automation at</div>
      <div className="marquee">
        <div className="marquee-track">
          {items.map((name, i) => (
            <span key={i}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}