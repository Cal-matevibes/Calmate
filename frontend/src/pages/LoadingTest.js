import React, { useState } from 'react';
import Loading from '../components/shared/Loading';
import Header from '../components/layout/Header';

const variants = [
  { label: 'Inline (loading-container)',    fullPage: false },
  { label: 'Full page (loading-fullpage)',  fullPage: true  },
  { label: 'Sin texto (text={false})',      fullPage: false, noText: true },
];

const backgrounds = [
  { label: 'Beige',  bg: '#f5f0e8', dark: false },
  { label: 'Blanco', bg: '#ffffff', dark: false },
  { label: 'Verde',  bg: '#2c3518', dark: true  },
];

export default function LoadingTest() {
  const [text, setText] = useState('Cargando...');
  const [bgIndex, setBgIndex] = useState(0);

  const { bg, dark } = backgrounds[bgIndex];

  return (
    <div>
      {/* Header */}
      <div>
        <div>
            <Header></Header>
        </div>
      </div>

      {/* Variants */}
      <div >
        {variants.map(({ label, fullPage, noText }) => (
          <div key={label}>            
            <div>
              <Loading
                text={noText ? false : (text || false)}
                fullPage={fullPage}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
