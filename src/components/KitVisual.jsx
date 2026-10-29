const kitLabels = {
  car: 'Friendly starter robot car',
  circuit: 'Colorful circuit board with components',
  gears: 'Mechanical gear and windmill build',
  sensors: 'Robot rover with distance sensors',
  robot: 'Smart tracked robot with controller',
  coding: 'Coding tablet and small robot',
  arm: 'Robotic arm kit',
  solar: 'Solar-powered automation barrier',
  drone: 'Four-propeller drone kit',
}

export default function KitVisual({ variant = 'car', className = '' }) {
  const label = kitLabels[variant] || kitLabels.car

  return (
    <svg className={`kit-visual ${className}`} viewBox="0 0 360 220" role="img" aria-label={label}>
      <defs>
        <linearGradient id="kitBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe087" />
          <stop offset="1" stopColor="#f4a91c" />
        </linearGradient>
        <linearGradient id="kitBoard" x1="0" x2="1">
          <stop stopColor="#293947" />
          <stop offset="1" stopColor="#101b28" />
        </linearGradient>
        <filter id="kitShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#72593a" floodOpacity=".2" />
        </filter>
      </defs>
      <ellipse cx="185" cy="188" rx="125" ry="15" fill="#bba17b" opacity=".18" />
      {variant === 'arm' ? (
        <g filter="url(#kitShadow)" stroke="#273c52" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M124 170h114l15 12H107z" fill="#40566c" />
          <path d="M161 164 174 120 212 99 228 66" fill="none" />
          <circle cx="163" cy="164" r="13" fill="#f3a623" />
          <circle cx="174" cy="120" r="13" fill="#f3a623" />
          <circle cx="212" cy="99" r="12" fill="#f3a623" />
          <path d="m223 68 13-14m-13 14 16 8" fill="none" />
        </g>
      ) : variant === 'drone' ? (
        <g filter="url(#kitShadow)" stroke="#344b60" strokeWidth="5" strokeLinecap="round">
          <path d="M179 106 108 74m73 30 74-31m-76 38-70 33m74-28 75 29" fill="none" />
          <path d="m156 93 26-11 25 12 3 35-27 16-28-15z" fill="#f1a51d" />
          <circle cx="107" cy="73" r="17" fill="#566c80" /><circle cx="256" cy="73" r="17" fill="#566c80" />
          <circle cx="107" cy="73" r="7" fill="#dbe9f4" /><circle cx="256" cy="73" r="7" fill="#dbe9f4" />
          <circle cx="109" cy="146" r="16" fill="#566c80" /><circle cx="255" cy="146" r="16" fill="#566c80" />
          <circle cx="109" cy="146" r="6" fill="#dbe9f4" /><circle cx="255" cy="146" r="6" fill="#dbe9f4" />
          <circle cx="182" cy="110" r="7" fill="#f36b08" stroke="none" />
        </g>
      ) : variant === 'circuit' ? (
        <g filter="url(#kitShadow)">
          <path d="M81 91q0-12 12-12h164q12 0 12 12v78q0 12-12 12H93q-12 0-12-12z" fill="#238b70" stroke="#14614f" strokeWidth="5" />
          <path d="M103 104h39v18h26m-65 25h34m28-45h37v20h28m-51 49v-24h25m-74-2v18h-24" fill="none" stroke="#9fe2a9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="145" y="106" width="36" height="42" rx="5" fill="#283849" stroke="#f2bc54" strokeWidth="4" />
          <rect x="204" y="134" width="36" height="26" rx="4" fill="#f4a921" stroke="#d17d12" strokeWidth="3" />
          <circle cx="113" cy="105" r="9" fill="#ff7655" /><circle cx="223" cy="102" r="8" fill="#f5d761" />
          <circle cx="119" cy="151" r="7" fill="#75cbfa" /><circle cx="250" cy="155" r="7" fill="#ff7655" />
          <path d="M101 79V61h30m105 130v-12m-139 12v-9m152-91h14" fill="none" stroke="#354d5d" strokeWidth="5" strokeLinecap="round" />
          <circle cx="131" cy="61" r="5" fill="#ed633c" /><circle cx="249" cy="170" r="5" fill="#ed633c" />
        </g>
      ) : variant === 'gears' ? (
        <g filter="url(#kitShadow)" stroke="#75502e" strokeWidth="5" strokeLinejoin="round">
          <path d="M128 175h118l15 12H111z" fill="#b97536" />
          <path d="M187 170V89" fill="none" stroke="#c27f36" strokeWidth="12" strokeLinecap="round" />
          <circle cx="187" cy="130" r="34" fill="#f2b83d" />
          <circle cx="187" cy="130" r="12" fill="#fff0d6" />
          <path d="m181 91 6-16 7 16 16 4-14 10 1 17-13-10-14 6 5-16-9-13z" fill="#ed7042" />
          <circle cx="246" cy="146" r="22" fill="#f3a623" />
          <circle cx="246" cy="146" r="7" fill="#fff0d6" />
          <path d="M244 117h5v7h-5zm0 50h5v7h-5zm-28-24h7v5h-7zm50 0h7v5h-7z" fill="#f3a623" />
          <path d="M137 142h16m-8-8v16" stroke="#fff0d6" strokeWidth="4" />
        </g>
      ) : variant === 'sensors' ? (
        <g filter="url(#kitShadow)">
          <path d="m94 130 23-38h132l29 38-17 43H108z" fill="#647b8d" stroke="#344b60" strokeWidth="5" />
          <path d="M133 102h96v48h-96z" fill="#f2b83d" stroke="#bb791c" strokeWidth="4" />
          <rect x="159" y="113" width="47" height="27" rx="5" fill="#293b4b" />
          <circle cx="169" cy="126" r="8" fill="#75d9e8" /><circle cx="195" cy="126" r="8" fill="#75d9e8" />
          <path d="M169 106V78m26 28V78" stroke="#344b60" strokeWidth="5" strokeLinecap="round" />
          <circle cx="169" cy="75" r="10" fill="#ed7042" /><circle cx="195" cy="75" r="10" fill="#ed7042" />
          <circle cx="125" cy="170" r="22" fill="#202c35" /><circle cx="125" cy="170" r="10" fill="#e1a31b" />
          <circle cx="250" cy="170" r="22" fill="#202c35" /><circle cx="250" cy="170" r="10" fill="#e1a31b" />
          <path d="M120 94 104 73m121 21 17-21" fill="none" stroke="#ed7042" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : variant === 'robot' ? (
        <g filter="url(#kitShadow)">
          <path d="m104 143 17-40h118l20 40-12 27H116z" fill="#536c82" stroke="#304758" strokeWidth="5" />
          <path d="M139 83q0-10 10-10h59q10 0 10 10v62h-79z" fill="#f1b33a" stroke="#a96c19" strokeWidth="4" />
          <rect x="153" y="91" width="51" height="35" rx="7" fill="#25394b" />
          <circle cx="166" cy="108" r="5" fill="#78d8ea" /><circle cx="190" cy="108" r="5" fill="#78d8ea" />
          <path d="M162 119h31" stroke="#78d8ea" strokeWidth="3" strokeLinecap="round" />
          <rect x="119" y="157" width="115" height="28" rx="13" fill="#263643" />
          <circle cx="137" cy="171" r="7" fill="#f3a623" /><circle cx="163" cy="171" r="7" fill="#f3a623" />
          <circle cx="190" cy="171" r="7" fill="#f3a623" /><circle cx="216" cy="171" r="7" fill="#f3a623" />
          <path d="M176 73V55m-14-1 14-13 14 13" fill="none" stroke="#ed7042" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : variant === 'coding' ? (
        <g filter="url(#kitShadow)">
          <path d="M81 72q0-10 11-10h116q11 0 11 10v84H81z" fill="#33495a" stroke="#263846" strokeWidth="5" />
          <rect x="94" y="74" width="112" height="65" rx="4" fill="#d9f1f5" />
          <rect x="105" y="84" width="38" height="9" rx="4" fill="#ed7042" />
          <rect x="105" y="101" width="67" height="7" rx="3" fill="#5bb8c7" />
          <rect x="105" y="115" width="51" height="7" rx="3" fill="#f2b83d" />
          <path d="M67 158h164l14 12H54z" fill="#647b8d" />
          <path d="m236 153 18-21h53l17 21-10 21h-68z" fill="#f2b83d" stroke="#a96c19" strokeWidth="4" />
          <rect x="259" y="138" width="30" height="20" rx="5" fill="#293b4b" />
          <circle cx="268" cy="147" r="3" fill="#78d8ea" /><circle cx="281" cy="147" r="3" fill="#78d8ea" />
          <circle cx="253" cy="174" r="12" fill="#263643" /><circle cx="302" cy="174" r="12" fill="#263643" />
        </g>
      ) : variant === 'solar' ? (
        <g filter="url(#kitShadow)">
          <path d="M91 166h171l14 14H78z" fill="#536c82" />
          <path d="M151 164v-62" stroke="#344b60" strokeWidth="11" strokeLinecap="round" />
          <circle cx="151" cy="135" r="15" fill="#f2b83d" stroke="#aa721c" strokeWidth="4" />
          <path d="m151 135 41-47" stroke="#ed7042" strokeWidth="9" strokeLinecap="round" />
          <path d="m181 82 20-7 11 31-20 7z" fill="#297ca5" stroke="#dff4ff" strokeWidth="3" />
          <path d="m190 81 10 29m-19-15 29-10" stroke="#a7e1f3" strokeWidth="2" />
          <rect x="96" y="128" width="36" height="27" rx="5" fill="#f1b33a" stroke="#a96c19" strokeWidth="3" />
          <circle cx="107" cy="141" r="5" fill="#ed7042" /><circle cx="122" cy="141" r="5" fill="#74cce0" />
          <path d="M228 165V119" stroke="#344b60" strokeWidth="7" strokeLinecap="round" />
          <path d="m228 120 31-12" stroke="#ed7042" strokeWidth="8" strokeLinecap="round" />
          <circle cx="228" cy="165" r="10" fill="#f2b83d" stroke="#aa721c" strokeWidth="3" />
        </g>
      ) : (
        <g filter="url(#kitShadow)">
          <path d="M91 125 124 90l124 3 35 33-14 43H108z" fill="url(#kitBody)" stroke="#bd8017" strokeWidth="3" />
          <path d="m153 92 11-43 72 3 10 43z" fill="url(#kitBoard)" />
          <path d="m170 53 53 2v10h-56z" fill="#263643" />
          <rect x="114" y="106" width="71" height="45" rx="11" fill="#f5cc8d" stroke="#d19b54" strokeWidth="2" />
          <circle cx="135" cy="124" r="12" fill="#fffdf8" stroke="#263b4e" strokeWidth="4" />
          <circle cx="165" cy="124" r="12" fill="#fffdf8" stroke="#263b4e" strokeWidth="4" />
          <circle cx="136" cy="125" r="4" fill="#263b4e" /><circle cx="166" cy="125" r="4" fill="#263b4e" />
          <path d="M140 140q11 13 22 0" fill="none" stroke="#263b4e" strokeWidth="3" strokeLinecap="round" />
          <path d="M195 99h44v42h-44z" fill="#d99413" />
          <rect x="218" y="109" width="41" height="19" rx="7" fill="#d6b38a" />
          <circle cx="133" cy="166" r="25" fill="#1e2830" /><circle cx="133" cy="166" r="13" fill="#df9e16" />
          <circle cx="250" cy="166" r="25" fill="#1e2830" /><circle cx="250" cy="166" r="13" fill="#df9e16" />
          <path d="M195 48c-1-18 17-22 23-10" fill="none" stroke="#e65d38" strokeWidth="5" strokeLinecap="round" />
          <circle cx="218" cy="37" r="6" fill="#e65d38" />
        </g>
      )}
    </svg>
  )
}
