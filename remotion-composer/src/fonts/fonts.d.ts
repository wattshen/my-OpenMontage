// Remotion's bundler turns an imported font file into a URL string.
declare module "*.woff2" {
  const url: string;
  export default url;
}

// TrueType fonts bundled the same way (Long Cang, Architects Daughter — SIL OFL 1.1).
declare module "*.ttf" {
  const url: string;
  export default url;
}
