export function CommunityMap() {
  return (
    <div className="journey-map" aria-hidden="true">
      <svg
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <pattern
            id="community-map-dots"
            width="11"
            height="11"
            patternUnits="userSpaceOnUse"
          >
            <rect x="1" y="1" width="3.75" height="3.75" rx="0.8" fill="currentColor" />
          </pattern>
        </defs>

        <g className="journey-map-land" fill="url(#community-map-dots)">
          <path d="M60 148C82 111 129 86 184 78c46-7 87 5 122 22 31 15 70 8 101 20 26 10 50 29 62 50l-27 19-39-4-20 27-36 10-8 31-31 19-34-15-24-27-37-7-23-22-43-2-31-22-42 3-18-18Z" />
          <path d="M286 61c19-18 49-26 80-20 26 5 45 20 57 40l-19 24-34 3-26-12-39 2-28-16 9-21Z" />
          <path d="M322 262c33-13 78 2 106 30 24 24 25 53 45 78l-14 31-8 40-21 45-26 39-22-23-5-40-17-28-13-41-18-35 7-34-22-31 8-31Z" />
          <path d="M480 161c22-20 49-30 77-27l27 17 25-10 30 9 13 22-19 18-32-1-20 18-29-7-21 12-28-15-30-2-15-12 22-22Z" />
          <path d="M610 132c39-35 94-48 146-39 36 6 71 1 108 9 46 10 84 32 123 47 35 14 80 15 111 40l38 39-22 28-44 3-31 26-47-4-37 20-35-12-32 16-31-22-25 10-19-34-41-3-27-31-37 2-24-22-31-6-19-30-38-6-10-31 33-24Z" />
          <path d="M553 242c32-18 77-20 115-5 31 13 58 42 68 77l-16 45-22 31-17 46-39 49-31-16-16-42-30-32-10-47-22-36 7-39-15-20 28-11Z" />
          <path d="M748 245l29 4 23 31-15 35-21 25-18-18 10-31-20-20 12-26Z" />
          <path d="M945 384c34-20 78-23 113-8l29 20 37 6 20 35-22 40-50 16-51-5-40 16-38-27-15-42 17-51Z" />
          <path d="M1088 502l18 7 10 24-19 17-15-20 6-28Z" />
          <path d="M1044 243l13-21 16 9-3 28-17 14-9-30Z" />
          <path d="M505 145l10-18 14 5 2 19-14 9-12-15Z" />
        </g>

        <g className="journey-map-satellites">
          <rect x="39" y="244" width="4" height="4" rx="1" />
          <rect x="88" y="306" width="5" height="5" rx="1" />
          <rect x="133" y="350" width="3" height="3" rx="0.75" />
          <rect x="186" y="289" width="4" height="4" rx="1" />
          <rect x="242" y="421" width="5" height="5" rx="1" />
          <rect x="283" y="342" width="3" height="3" rx="0.75" />
          <rect x="524" y="103" width="4" height="4" rx="1" />
          <rect x="564" y="82" width="3" height="3" rx="0.75" />
          <rect x="711" y="66" width="5" height="5" rx="1" />
          <rect x="822" y="59" width="3" height="3" rx="0.75" />
          <rect x="1126" y="145" width="4" height="4" rx="1" />
          <rect x="1160" y="304" width="5" height="5" rx="1" />
          <rect x="907" y="349" width="3" height="3" rx="0.75" />
          <rect x="852" y="426" width="4" height="4" rx="1" />
          <rect x="784" y="491" width="5" height="5" rx="1" />
          <rect x="544" y="509" width="3" height="3" rx="0.75" />
          <rect x="311" y="519" width="4" height="4" rx="1" />
          <rect x="101" y="489" width="3" height="3" rx="0.75" />
        </g>
      </svg>
    </div>
  )
}
