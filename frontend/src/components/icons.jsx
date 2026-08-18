/**
 * Small inline SVG icon set.
 *
 * Inlined rather than pulled from an icon package: the app needs a dozen glyphs,
 * and this keeps the bundle small with no extra dependency to justify.
 */

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

const Icon = ({ size, children, ...rest }) => (
  <svg {...base} {...(size ? { width: size, height: size } : null)} {...rest}>
    {children}
  </svg>
);

export const MapPinIcon = (props) => (
  <Icon {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const BriefcaseIcon = (props) => (
  <Icon {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

export const ClockIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const LayersIcon = (props) => (
  <Icon {...props}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Icon>
);

export const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Icon>
);

export const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);

export const AlertIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5" />
    <path d="M12 16h.01" />
  </Icon>
);

export const DatabaseIcon = (props) => (
  <Icon {...props}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </Icon>
);

export const InfoIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Icon>
);

export const InboxIcon = (props) => (
  <Icon {...props}>
    <path d="M4 13h4l2 3h4l2-3h4" />
    <path d="M5 5h14l3 8v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5l3-8Z" />
  </Icon>
);

export const GitBranchIcon = (props) => (
  <Icon {...props}>
    <circle cx="7" cy="5" r="2.5" />
    <circle cx="7" cy="19" r="2.5" />
    <circle cx="17" cy="12" r="2.5" />
    <path d="M7 7.5v9" />
    <path d="M9.4 6.4 14.7 10.8" />
  </Icon>
);
