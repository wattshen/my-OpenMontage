import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SHOTCRAFT_CAPTIONS } from "./shotcraft-v6-captions";

const W = 1080;
const H = 1920;
const FPS = 30;

const C = {
  bg: "#08090B",
  panel: "#101013",
  panel2: "#151519",
  text: "#ECECEF",
  muted: "#8B8B94",
  dim: "#55555E",
  amber: "#F0A83C",
  green: "#4FC283",
  paper: "#F2E9D5",
  red: "#E5544B",
  blue: "#6088D9",
};

const FONT_CN =
  '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';
const FONT_MONO = '"JetBrains Mono", Consolas, monospace';

const seconds = (value: number) => Math.round(value * FPS);
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

type Focus = { x: number; y: number };

const PageWindow: React.FC<{
  src: string;
  pageW: number;
  pageH: number;
  zoom: number;
  focus: Focus;
}> = ({ src, pageW, pageH, zoom, focus }) => {
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.bg }}>
      <div
        style={{
          position: "absolute",
          width: pageW,
          height: pageH,
          left: W / 2 / zoom - focus.x,
          top: H / 2 / zoom - focus.y,
          zoom,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
};

const PageCrop: React.FC<{
  src: string;
  pageW: number;
  pageH: number;
  x: number;
  y: number;
  w: number;
  h: number;
  style?: React.CSSProperties;
}> = ({ src, pageW, pageH, x, y, w, h, style }) => (
  <div style={{ position: "relative", overflow: "hidden", ...style }}>
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        width: `${(pageW / w) * 100}%`,
        height: `${(pageH / h) * 100}%`,
        left: `${(-x / w) * 100}%`,
        top: `${(-y / h) * 100}%`,
        maxWidth: "none",
        display: "block",
      }}
    />
  </div>
);

const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity,
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(255,255,255,.12) 0px, rgba(255,255,255,.12) 1px, transparent 1px, transparent 4px)",
      mixBlendMode: "soft-light",
    }}
  />
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 78% 72% at 50% 46%, transparent 44%, rgba(0,0,0,.32) 76%, rgba(0,0,0,.72) 100%)",
    }}
  />
);

const LowerScrim: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      top: "auto",
      height: 300,
      background:
        "linear-gradient(to top, rgba(8,9,11,.96) 0%, rgba(8,9,11,.86) 28%, rgba(8,9,11,.36) 68%, transparent 100%)",
    }}
  />
);

const TopScrim: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      bottom: "auto",
      height: 300,
      background:
        "linear-gradient(to bottom, rgba(8,9,11,.94) 0%, rgba(8,9,11,.72) 42%, transparent 100%)",
    }}
  />
);

const Scene: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
  fade?: number;
}> = ({ durationInFrames, children, fade = 8 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, Math.min(fade, durationInFrames)], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const MonoLabel: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = C.muted, style }) => (
  <div
    style={{
      fontFamily: FONT_MONO,
      fontSize: 27,
      lineHeight: 1.25,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}> = ({ children, color = C.amber, filled = false, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 18px",
      borderRadius: 999,
      border: `1.5px solid ${color}66`,
      background: filled ? `${color}18` : "rgba(8,9,11,.72)",
      color,
      fontFamily: FONT_CN,
      fontSize: 31,
      fontWeight: 600,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Headline: React.FC<{
  eyebrow?: string;
  children: React.ReactNode;
  subline?: string;
  color?: string;
  size?: number;
}> = ({ eyebrow, children, subline, color = C.text, size = 82 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 18], [28, 0], { ...clamp, easing: easeOut });
  const opacity = interpolate(frame, [0, 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 330,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      {eyebrow ? (
        <MonoLabel color={color} style={{ marginBottom: 20, fontSize: 25 }}>
          {eyebrow}
        </MonoLabel>
      ) : null}
      <div
        style={{
          fontFamily: FONT_CN,
          color,
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.14,
          letterSpacing: "-0.04em",
          textWrap: "balance",
        }}
      >
        {children}
      </div>
      {subline ? (
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_CN,
            color: C.muted,
            fontSize: 34,
            lineHeight: 1.45,
          }}
        >
          {subline}
        </div>
      ) : null}
    </div>
  );
};

const ScanLine: React.FC<{
  progress: number;
  top: number;
  height: number;
  color?: string;
}> = ({ progress, top, height, color = C.amber }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: top + Math.max(0, Math.min(1, progress)) * height,
      height: 2,
      background: `linear-gradient(90deg, transparent 0%, ${color}22 12%, ${color} 50%, ${color}22 88%, transparent 100%)`,
      boxShadow: `0 0 22px ${color}`,
      opacity: 0.9,
    }}
  />
);

const TargetBox: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  color?: string;
  progress?: number;
}> = ({ x, y, w, h = 66, label, color = C.amber, progress = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w * progress,
      height: h,
      border: `2px solid ${color}`,
      borderRadius: 6,
      background: `${color}12`,
      boxShadow: `0 0 0 1px rgba(0,0,0,.7), 0 0 30px ${color}22`,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 10,
        top: -38,
        fontFamily: FONT_MONO,
        fontSize: 22,
        letterSpacing: "0.08em",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  </div>
);

const BrowserChrome: React.FC<{ children: React.ReactNode; label: string }> = ({
  children,
  label,
}) => (
  <div
    style={{
      position: "absolute",
      inset: "150px 56px 250px",
      borderRadius: 26,
      overflow: "hidden",
      background: C.panel,
      border: "1px solid #26262D",
      boxShadow: "0 35px 90px rgba(0,0,0,.65)",
    }}
  >
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 22px",
        borderBottom: "1px solid #26262D",
        background: "#0D0D10",
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 99, background: "#3A3A42" }} />
      <span style={{ width: 12, height: 12, borderRadius: 99, background: "#3A3A42" }} />
      <span style={{ width: 12, height: 12, borderRadius: 99, background: "#3A3A42" }} />
      <MonoLabel style={{ marginLeft: 10, fontSize: 22, letterSpacing: "0.08em" }}>
        {label}
      </MonoLabel>
    </div>
    <div style={{ position: "absolute", inset: "64px 0 0" }}>{children}</div>
  </div>
);

const FitImage: React.FC<{
  src: string;
  objectPosition?: string;
  scale?: number;
  y?: number;
}> = ({ src, objectPosition = "center", scale = 1, y = 0 }) => (
  <Img
    src={staticFile(`textures/openmontage/${src}`)}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition,
      transform: `scale(${scale}) translateY(${y}px)`,
    }}
  />
);

const LibraryCraneShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const zoom = interpolate(p, [0, 1], [2.04, 1.94]);
  const focus = {
    x: interpolate(p, [0, 1], [470, 690]),
    y: H / (2 * zoom),
  };
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/library-full.png"
        pageW={1920}
        pageH={1080}
        zoom={zoom}
        focus={focus}
      />
      <Vignette />
      <LowerScrim />
    </AbsoluteFill>
  );
};

const BoardIntroShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        zoom={1.05}
        focus={{ x: 960, y: 920 + p * 280 }}
      />
      <Vignette />
      <LowerScrim />
    </AbsoluteFill>
  );
};

const StageRailShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const scan = (frame % 90) / 90;
  const zoom = 1.55;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        zoom={zoom}
        focus={{ x: 700 + p * 40, y: H / (2 * zoom) }}
      />
      <ScanLine progress={scan} top={132} height={248} />
      <Vignette />
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 856,
          width: 700,
          padding: "26px 30px 30px",
          background: "rgba(8,9,11,.93)",
          borderLeft: `3px solid ${C.amber}`,
        }}
      >
        <MonoLabel color={C.amber}>HUMAN CHECKPOINTS</MonoLabel>
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT_CN,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.18,
            color: C.text,
          }}
        >
          五个关卡点，
          <br />
          点五次通过。
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const ScriptScanShot: React.FC<{
  src: string;
  durationInFrames: number;
  focus: Focus;
  zoom?: number;
  tag: string;
  callout: { value: string; label: string; detail: string };
}> = ({ src, durationInFrames, focus, zoom = 1.5, tag, callout }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src={`textures/openmontage/${src}`}
        pageW={1280}
        pageH={2160}
        zoom={zoom}
        focus={{ x: focus.x, y: focus.y + p * 46 }}
      />
      <ScanLine progress={(frame % 110) / 110} top={210} height={900} color={C.amber} />
      <Vignette />
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 70,
          padding: "10px 16px",
          border: `1px solid ${C.amber}55`,
          borderRadius: 8,
          background: "rgba(8,9,11,.82)",
        }}
      >
        <MonoLabel color={C.amber} style={{ fontSize: 23 }}>
          {tag}
        </MonoLabel>
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 320,
          padding: "22px 28px 22px 30px",
          borderLeft: `4px solid ${C.amber}`,
          background:
            "linear-gradient(90deg, rgba(8,9,11,.95) 0%, rgba(8,9,11,.86) 58%, rgba(8,9,11,.28) 86%, transparent 100%)",
        }}
      >
        <div style={{ fontFamily: FONT_MONO, fontSize: 76, fontWeight: 700, letterSpacing: "-0.04em", color: C.amber }}>
          {callout.value}
        </div>
        <div style={{ marginTop: 12, fontFamily: FONT_CN, fontSize: 36, fontWeight: 600, color: C.text }}>
          {callout.label}
        </div>
        <div style={{ marginTop: 8, fontFamily: FONT_CN, fontSize: 27, color: C.muted }}>
          {callout.detail}
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const StoryboardPanShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: "460px -820px 620px -500px" }}>
        <div
          style={{
            width: 2400,
            height: 700,
            transform: `translateX(${-p * 780}px)`,
          }}
        >
          <Img
            src={staticFile("textures/openmontage/storyboard-strip-0.png")}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,9,11,.98) 0%, rgba(8,9,11,.3) 12%, transparent 30%, transparent 70%, rgba(8,9,11,.3) 88%, rgba(8,9,11,.98) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 66, top: 185 }}>
        <MonoLabel color={C.amber}>STORYBOARD / 23 SCENES</MonoLabel>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_CN,
            fontSize: 78,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.1,
          }}
        >
          先排分镜，
          <br />
          再动画面。
        </div>
      </div>
      <Vignette />
      <LowerScrim />
    </AbsoluteFill>
  );
};

const DecisionsPanShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div
        style={{
          position: "absolute",
          width: 980,
          left: 50,
          top: 80 - p * 720,
        }}
      >
        <Img
          src={staticFile("textures/openmontage/board-decisions.png")}
          style={{ width: "100%", display: "block", borderRadius: 18 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 250,
          right: 54,
          width: 380,
          padding: "22px 24px",
          border: `1px solid ${C.amber}55`,
          borderRadius: 16,
          background: "rgba(8,9,11,.84)",
          backdropFilter: "blur(10px)",
        }}
      >
        <MonoLabel color={C.amber}>DECISION LOG</MonoLabel>
        <div style={{ marginTop: 14, color: C.text, fontSize: 32, lineHeight: 1.55 }}>
          不是黑盒：
          <br />
          工具、降级、成本、风险
          <br />
          都留在记录里。
        </div>
      </div>
      <Vignette />
      <LowerScrim />
    </AbsoluteFill>
  );
};

const EvidenceGrid: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const items = [
    ["60万", "半月涨粉", C.green],
    ["78万", "20天涨粉", C.amber],
    ["¥0.1", "单条成本", C.blue],
    ["9,000", "单条播放", C.text],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageCrop
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        x={1324}
        y={380}
        w={336}
        h={1616}
        style={{
          position: "absolute",
          left: 690,
          top: 0,
          width: 390,
          height: 1876,
          opacity: 0.88,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, #08090B 0%, #08090B 46%, rgba(8,9,11,.92) 58%, rgba(8,9,11,.18) 78%, rgba(8,9,11,.55) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, top: 150 }}>
        <MonoLabel color={C.amber}>THE SCOREBOARD / REAL NUMBERS</MonoLabel>
      </div>
      <div style={{ position: "absolute", left: 64, top: 240, width: 620 }}>
        {items.map(([value, label, color], index) => {
          const enter = spring({
            frame: frame - index * 8,
            fps: FPS,
            config: { damping: 18, stiffness: 120, mass: 0.8 },
          });
          return (
            <div
              key={label}
              style={{
                height: 214,
                borderTop: "1px solid #2A2A33",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                opacity: enter,
                transform: `translateX(${(1 - enter) * -36}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: C.dim }}>0{index + 1}</div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 84,
                    fontWeight: 700,
                    letterSpacing: "-0.06em",
                    color: color as string,
                  }}
                >
                  {value as string}
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONT_CN,
                  fontSize: 30,
                  color: C.text,
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                {label as string}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 64, top: 1130, display: "flex", gap: 10 }}>
        <Chip filled>真实账号</Chip>
        <Chip color={C.green}>真实成本</Chip>
        <Chip color={C.text}>真实播放</Chip>
      </div>
      <div style={{ position: "absolute", left: 64, top: 1236, fontFamily: FONT_CN, fontSize: 28, lineHeight: 1.5, color: C.muted }}>
        3 个真实账号 · 2026.02 — 03
        <br />
        数字不是模拟，是跑出来的。
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const ZeroThresholdShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 16], [0.72, 1], {
    ...clamp,
    easing: easeOut,
  });
  const blur = interpolate(frame, [0, 18], [14, 7], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px) grayscale(.8)`, opacity: 0.32 }}>
        <FitImage src="old-final-freeze.png" scale={1.18} />
      </div>
      <AbsoluteFill style={{ background: "rgba(8,9,11,.72)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            transform: `scale(${scale})`,
            fontFamily: FONT_MONO,
            fontSize: 250,
            fontWeight: 700,
            letterSpacing: "-0.1em",
            color: C.amber,
            textShadow: "0 0 80px rgba(240,168,60,.18)",
          }}
        >
          门槛 = 0
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: FONT_CN,
            fontSize: 40,
            color: C.text,
          }}
        >
          做不出来，已经不再是门槛。
        </div>
      </AbsoluteFill>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

const TerminalShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const lines = [
    ["PS D:\\code\\my-openmontage>", " .\\.venv\\Scripts\\python.exe render_v5.py"],
    ["[research]", "12 sources -> research_brief.json"],
    ["[proposal]", "concept + budget -> proposal_packet.json"],
    ["[script]", "8 sections -> script.json"],
    ["[scene_plan]", "23 scenes -> scene_plan.json"],
    ["[assets]", "TTS / music / Backlot snapshots"],
    ["[edit]", "cuts + captions + render props"],
    ["[compose]", "Remotion -> H.264 / AAC / 1080x1920"],
    ["[probe]", "159.96s · 30fps · 14.9 MB"],
    ["[done]", "projects/openmontage-douyin-30s/renders/final_v5_sub.mp4"],
  ];
  const shown = Math.min(lines.length, Math.floor(frame / 13) + 1);
  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, padding: "180px 48px 320px" }}>
      <BrowserChrome label="LOCAL RENDER / OPENMONTAGE">
        <div
          style={{
            padding: "34px 34px",
            fontFamily: FONT_MONO,
            fontSize: 29,
            lineHeight: 1.7,
            color: "#D5D5DA",
          }}
        >
          {lines.slice(0, shown).map(([tag, text], index) => (
            <div key={`${tag}-${index}`} style={{ display: "flex", gap: 18 }}>
              <span style={{ color: index === 0 ? C.amber : C.green, minWidth: 210 }}>{tag}</span>
              <span style={{ color: index === 0 ? C.text : "#B7B7BF" }}>{text}</span>
            </div>
          ))}
          <span style={{ color: C.amber }}>{cursorOn ? "█" : " "}</span>
        </div>
      </BrowserChrome>
      <div style={{ position: "absolute", left: 70, bottom: 350 }}>
        <MonoLabel color={C.green}>LOCAL / TRACEABLE</MonoLabel>
        <div style={{ marginTop: 16, fontFamily: FONT_CN, fontSize: 58, color: C.text, fontWeight: 700 }}>
          不是生成一段视频，
          <br />
          是跑完一条产线。
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

type TickerItem = { src: string; fit?: "cover" | "contain"; position?: string };

const TickerCard: React.FC<{ item: TickerItem }> = ({ item }) => (
  <div
    style={{
      width: "100%",
      height: 330,
      borderRadius: 18,
      overflow: "hidden",
      background: "#111116",
      border: "1px solid rgba(255,255,255,.10)",
      boxShadow: "0 14px 34px rgba(0,0,0,.42)",
    }}
  >
    <Img
      src={staticFile(`textures/openmontage/${item.src}`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: item.fit ?? "cover",
        objectPosition: item.position ?? "center",
        display: "block",
      }}
    />
  </div>
);

const TickerColumn: React.FC<{
  items: TickerItem[];
  direction: -1 | 1;
  loopSeconds: number;
  width: number;
}> = ({ items, direction, loopSeconds, width }) => {
  const frame = useCurrentFrame();
  const progress = (frame % (loopSeconds * FPS)) / (loopSeconds * FPS);
  const translateY = direction === -1 ? progress * -50 : -50 + progress * 50;
  return (
    <div style={{ width, height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          transform: `translateY(${translateY}%)`,
        }}
      >
        {[...items, ...items].map((item, index) => (
          <TickerCard key={`${item.src}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const PageWaterfallShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.06], clamp);
  const columns: { items: TickerItem[]; direction: -1 | 1; loopSeconds: number }[] = [
    {
      items: [
        { src: "story-card-01.png", fit: "cover" },
        { src: "board-stages.png", fit: "contain" },
        { src: "story-card-02.png", fit: "cover" },
      ],
      direction: -1,
      loopSeconds: 12,
    },
    {
      items: [
        { src: "story-card-04.png", fit: "cover" },
        { src: "board-script.png", fit: "cover" },
        { src: "story-card-05.png", fit: "cover" },
      ],
      direction: 1,
      loopSeconds: 9,
    },
    {
      items: [
        { src: "board-decisions.png", fit: "cover", position: "top" },
        { src: "story-card-03.png", fit: "cover" },
        { src: "board-render.png", fit: "cover" },
      ],
      direction: -1,
      loopSeconds: 14,
    },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: W / push,
          height: H / push,
          zoom: push,
          perspective: 1000,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            gap: 28,
            padding: "150px 18px",
            transform: "rotateX(16deg) scale(1.12)",
            transformOrigin: "center center",
          }}
        >
          {columns.map((column, index) => (
            <TickerColumn
              key={index}
              items={column.items}
              direction={column.direction}
              loopSeconds={column.loopSeconds}
              width={315}
            />
          ))}
        </div>
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, #08090B 0%, rgba(8,9,11,.86) 10%, transparent 30%, transparent 67%, rgba(8,9,11,.88) 90%, #08090B 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, bottom: 338 }}>
        <Chip filled>23 个场景</Chip>
        <div style={{ marginTop: 22, fontFamily: FONT_CN, fontSize: 60, color: C.text, fontWeight: 700 }}>
          不是一张图，
          <br />
          是整块分镜墙在流动。
        </div>
      </div>
      <Vignette />
      <LowerScrim />
    </AbsoluteFill>
  );
};

const RenderHeroShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        zoom={1.62 + p * 0.08}
        focus={{ x: 800, y: 2040 }}
      />
      <Vignette />
      <div style={{ position: "absolute", left: 64, top: 160 }}>
        <MonoLabel color={C.green}>RENDER LOG / REAL OUTPUT</MonoLabel>
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 338, display: "flex", gap: 14 }}>
        <Chip color={C.green}>H.264 + AAC</Chip>
        <Chip filled>1080 × 1920</Chip>
        <Chip color={C.text}>本地文件</Chip>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 34,
      padding: 10,
      background: "#151519",
      border: "1px solid #3A3A43",
      boxShadow: "0 32px 90px rgba(0,0,0,.8), 0 0 0 7px #050506",
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", inset: 10, borderRadius: 26, overflow: "hidden", background: "#000" }}>
      {children}
    </div>
  </div>
);

const OldFinalPlaybackShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const freezeAt = Math.round(durationInFrames * 0.68);
  const translate = interpolate(frame, [0, 20], [120, 0], { ...clamp, easing: easeOut });
  const frozen = frame >= freezeAt;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.42 }}>
        <PageWindow
          src="textures/openmontage/board-full.png"
          pageW={1920}
          pageH={2829}
          zoom={1.14}
          focus={{ x: 760, y: 900 }}
        />
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,9,11,.72) 0%, rgba(8,9,11,.42) 42%, rgba(8,9,11,.18) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 268,
          width: 468,
          height: 832,
          transform: `translateY(${translate}px)`,
        }}
      >
        <PhoneFrame>
          {frozen ? (
            <Img
              src={staticFile("textures/openmontage/old-final-freeze.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <OffthreadVideo
              src={staticFile("textures/openmontage/old-final-clip.mp4")}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </PhoneFrame>
      </div>
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 1120,
          width: 468,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Chip color={C.green} style={{ fontSize: 23, padding: "8px 14px" }}>H.264</Chip>
        <Chip filled style={{ fontSize: 23, padding: "8px 14px" }}>1080 × 1920</Chip>
        <Chip color={C.text} style={{ fontSize: 23, padding: "8px 14px" }}>159.96s</Chip>
      </div>
      <div
        style={{
          position: "absolute",
          left: 566,
          top: 372,
          width: 448,
          height: 800,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid #30303A",
          background: C.panel,
          boxShadow: "0 28px 80px rgba(0,0,0,.6)",
        }}
      >
        <PageCrop
          src="textures/openmontage/board-full.png"
          pageW={1920}
          pageH={2829}
          x={1324}
          y={380}
          w={336}
          h={599}
          style={{ width: 448, height: 800 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,9,11,.86) 0%, rgba(8,9,11,.1) 18%, rgba(8,9,11,.1) 76%, rgba(8,9,11,.9) 100%)",
          }}
        />
        <div style={{ position: "absolute", left: 20, top: 18 }}>
          <MonoLabel color={C.amber} style={{ fontSize: 22 }}>
            DECISION LOG
          </MonoLabel>
        </div>
      </div>
      <div style={{ position: "absolute", left: 66, top: 84 }}>
        <MonoLabel color={C.amber}>OLD RENDER / REAL OUTPUT</MonoLabel>
      </div>
      <div style={{ position: "absolute", left: 66, bottom: 338 }}>
        <div style={{ fontFamily: FONT_CN, fontSize: 62, fontWeight: 700, color: C.text, lineHeight: 1.18 }}>
          它确实能
          <br />
          自动跑完。
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const FailureFreezeShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const entries = [
    { label: "口型对不上", sub: "lip sync", delay: 0 },
    { label: "画面穿帮", sub: "continuity", delay: 9 },
    { label: "观点空洞", sub: "point of view", delay: 18 },
  ];
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 78% 22%, rgba(229,84,75,.10) 0%, transparent 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 54,
          top: 300,
          width: 392,
          height: 697,
          transform: `translateX(${(1 - p) * -30}px)`,
        }}
      >
        <PhoneFrame>
          <Img
            src={staticFile("textures/openmontage/old-final-freeze.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.7)" }}
          />
        </PhoneFrame>
      </div>
      <div style={{ position: "absolute", left: 54, top: 1040, display: "flex", gap: 10 }}>
        <Chip color={C.green}>V5</Chip>
        <Chip filled>能跑完</Chip>
      </div>
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 1160,
          fontFamily: FONT_MONO,
          fontSize: 19,
          lineHeight: 2,
          letterSpacing: "0.12em",
          color: C.dim,
        }}
      >
        29 CUTS · 0 SOURCE SHOTS
        <br />
        10 CARD TYPES · 158.9S
      </div>
      {entries.map((entry, index) => {
        const enter = spring({
          frame: frame - entry.delay,
          fps: FPS,
          config: { damping: 14, stiffness: 140, mass: 0.7 },
        });
        return (
          <div
            key={entry.label}
            style={{
              position: "absolute",
              left: 502,
              top: 348 + index * 270,
              width: 522,
              height: 216,
              display: "flex",
              alignItems: "center",
              gap: 22,
              transform: `translateX(${(1 - enter) * 90}px)`,
              opacity: enter,
              padding: "0 26px",
              border: `1px solid ${C.red}55`,
              borderRadius: 18,
              background: "rgba(14,11,13,.86)",
            }}
          >
            <div style={{ fontFamily: FONT_MONO, fontSize: 58, color: C.red, lineHeight: 1 }}>×</div>
            <div>
              <div style={{ fontFamily: FONT_CN, fontSize: 44, fontWeight: 700, color: C.text }}>{entry.label}</div>
              <div style={{ marginTop: 8, fontFamily: FONT_MONO, fontSize: 22, letterSpacing: "0.1em", color: C.muted }}>
                {entry.sub}
              </div>
            </div>
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          top: "auto",
          height: 600,
          background:
            "linear-gradient(to top, #08090B 0%, rgba(8,9,11,.92) 42%, transparent 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 68, bottom: 338 }}>
        <MonoLabel color={C.red}>RUN COMPLETE ≠ MAKE SENSE</MonoLabel>
        <div style={{ marginTop: 18, fontFamily: FONT_CN, fontSize: 62, fontWeight: 700, color: C.text, lineHeight: 1.18 }}>
          能放心交给 AI 的，
          <br />
          只有渲染。
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const RunVsJudgeShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, padding: 64, justifyContent: "center" }}>
      <MonoLabel color={C.amber}>WHAT AI CANNOT DELIVER</MonoLabel>
      <div
        style={{
          marginTop: 84,
          display: "flex",
          alignItems: "stretch",
          gap: 24,
          height: 890,
        }}
      >
        <div
          style={{
            flex: 1,
            border: "1px solid #2C2C34",
            borderRadius: 28,
            background: "linear-gradient(180deg, #151519 0%, #0D0D10 100%)",
            padding: 38,
            transform: `translateX(${-p * 18}px)`,
          }}
        >
          <MonoLabel color={C.green}>CAN RUN</MonoLabel>
          <div style={{ marginTop: 58, fontFamily: FONT_CN, fontSize: 72, fontWeight: 700, color: C.text, lineHeight: 1.12 }}>
            能跑完
            <br />
            一条流程
          </div>
          <div style={{ marginTop: 54, display: "grid", gap: 22 }}>
            {["查资料", "写稿", "分镜", "配音", "渲染"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 16, color: C.muted, fontFamily: FONT_CN, fontSize: 36 }}>
                <span style={{ color: C.green }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            border: `1px solid ${C.amber}55`,
            borderRadius: 28,
            background: "linear-gradient(180deg, rgba(240,168,60,.12) 0%, #0D0D10 100%)",
            padding: 38,
            transform: `translateX(${p * 18}px)`,
          }}
        >
          <MonoLabel color={C.amber}>CAN JUDGE</MonoLabel>
          <div style={{ marginTop: 58, fontFamily: FONT_CN, fontSize: 72, fontWeight: 700, color: C.text, lineHeight: 1.12 }}>
            会判断
            <br />
            什么值得
          </div>
          <div style={{ marginTop: 54, display: "grid", gap: 22 }}>
            {["创意", "审美", "表达", "取舍", "否决"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 16, color: C.muted, fontFamily: FONT_CN, fontSize: 36 }}>
                <span style={{ color: C.amber }}>?</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const TemplateFloodShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const cards = [
    "story-card-01.png",
    "story-card-02.png",
    "story-card-03.png",
    "story-card-04.png",
    "story-card-05.png",
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {Array.from({ length: 15 }).map((_, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const src = cards[(row + col) % cards.length];
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              width: 300,
              height: 330,
              left: -70 + col * 330,
              top: -60 + row * 365 + p * (row % 2 === 0 ? -16 : 16),
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,.08)",
              opacity: 0.24 + row * 0.055,
              filter: "saturate(.4)",
            }}
          >
            <Img
              src={staticFile(`textures/openmontage/${src}`)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        );
      })}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,9,11,.95) 0%, rgba(8,9,11,.68) 52%, rgba(8,9,11,.2) 100%)" }} />
      <div style={{ position: "absolute", left: 64, top: 230, width: 830 }}>
        <MonoLabel color={C.red}>THE TEMPLATE TRAP</MonoLabel>
        <div style={{ marginTop: 22, fontFamily: FONT_CN, fontSize: 82, fontWeight: 700, lineHeight: 1.12, color: C.text }}>
          同一个模型，
          <br />
          同一套模板。
        </div>
        <div style={{ marginTop: 30, fontFamily: FONT_CN, fontSize: 38, lineHeight: 1.6, color: C.muted }}>
          窗口期真正危险的地方：
          <br />
          不是做不出来，而是看起来都一样。
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const PlatformRulesShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const rejected = ["低质", "同质", "不标注"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.48 }}>
        <PageWindow
          src="textures/openmontage/board-full.png"
          pageW={1920}
          pageH={2829}
          zoom={1.3}
          focus={{ x: 900, y: 1050 + p * 90 }}
        />
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,9,11,.96) 0%, rgba(8,9,11,.9) 46%, rgba(8,9,11,.42) 74%, rgba(8,9,11,.72) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 56, top: 150, width: 690 }}>
        <MonoLabel color={C.red}>WHAT GETS PENALIZED</MonoLabel>
        <div style={{ marginTop: 20, fontFamily: FONT_CN, fontSize: 62, fontWeight: 700, lineHeight: 1.16, color: C.text }}>
          平台压的不是 AI，
          <br />
          是低质和同质。
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 170,
          width: 270,
          padding: "18px 20px",
          border: `1px solid ${C.green}55`,
          borderRadius: 14,
          background: "rgba(8,9,11,.78)",
          textAlign: "right",
        }}
      >
        <MonoLabel color={C.green} style={{ fontSize: 20 }}>
          PLATFORM SUPPORT
        </MonoLabel>
        <div style={{ marginTop: 10, fontFamily: FONT_CN, fontSize: 28, fontWeight: 600, color: C.text }}>
          扶持 AI 知识内容
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, width: 690, top: 520, display: "grid", gap: 18 }}>
        {rejected.map((item, index) => {
          const enter = spring({
            frame: frame - index * 14,
            fps: FPS,
            config: { damping: 11, stiffness: 130, mass: 0.7 },
          });
          return (
            <div
              key={item}
              style={{
                height: 196,
                border: `2px solid ${C.red}66`,
                borderRadius: 18,
                background: "rgba(16,16,19,.92)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 36px",
                transform: `scale(${0.82 + enter * 0.18}) rotate(${(1 - enter) * -2}deg)`,
                opacity: enter,
              }}
            >
              <div style={{ fontFamily: FONT_CN, fontSize: 58, color: C.text, fontWeight: 700 }}>{item}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: C.red, letterSpacing: "0.1em" }}>REJECT</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 56, top: 1200 }}>
        <MonoLabel color={C.muted}>低质 / 同质 / 不标注 → 直接压</MonoLabel>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const ScarcityShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const chips = ["有观点", "有过程", "老实标注"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.58, filter: "blur(3px)" }}>
        <PageWindow
          src="textures/openmontage/board-full.png"
          pageW={1920}
          pageH={2829}
          zoom={1.18}
          focus={{ x: 1000, y: 1120 }}
        />
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,9,11,.94) 0%, rgba(8,9,11,.78) 52%, rgba(8,9,11,.3) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, top: 200, width: 760 }}>
        <MonoLabel color={C.green}>SCARCITY</MonoLabel>
        <div style={{ marginTop: 24, fontFamily: FONT_CN, fontSize: 68, fontWeight: 700, color: C.text, lineHeight: 1.16 }}>
          模板号，
          <br />
          会被打死。
        </div>
        <div style={{ marginTop: 28, fontFamily: FONT_CN, fontSize: 36, lineHeight: 1.5, color: C.muted }}>
          稀缺的，是有判断的内容。
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 24,
          top: 500,
          fontFamily: FONT_CN,
          fontSize: 210,
          fontWeight: 700,
          color: "rgba(79,194,131,.08)",
          transform: "rotate(-8deg)",
        }}
      >
        稀缺
      </div>
      <div style={{ position: "absolute", left: 64, top: 720, width: 620 }}>
        {chips.map((chip, index) => {
          const enter = spring({
            frame: frame - index * 10,
            fps: FPS,
            config: { damping: 15, stiffness: 120, mass: 0.8 },
          });
          return (
            <div
              key={chip}
              style={{
                opacity: enter,
                transform: `translateX(${(1 - enter) * 60}px)`,
                borderTop: "1px solid #31313A",
                padding: "26px 4px",
                display: "flex",
                alignItems: "center",
                gap: 18,
                color: C.text,
                fontFamily: FONT_CN,
                fontSize: 42,
                fontWeight: 600,
              }}
            >
              <span style={{ color: C.green, fontFamily: FONT_MONO }}>✓</span>
              {chip}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 64, top: 1180 }}>
        <Chip color={C.green}>稀缺货</Chip>
        <Chip color={C.text} style={{ marginLeft: 10 }}>不是产能</Chip>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const AnswerIntroShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        zoom={2.35}
        focus={{ x: 790, y: 1110 + p * 80 }}
      />
      <Vignette />
      <Headline
        eyebrow="THE ROLE IS CHANGING"
        color={C.green}
        size={78}
        subline="不是剪辑师，也不是提示词工人。"
      >
        新岗位：
        <br />
        AI 的甲方
      </Headline>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const CapabilityTriptychShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const items = [
    { title: "品味", sub: "知道什么是好的", glyph: "◉" },
    { title: "表达", sub: "把需求说清楚", glyph: "⌁" },
    { title: "否决权", sub: "敢不敢打回重做", glyph: "✕" },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <PageWindow
          src="textures/openmontage/board-full.png"
          pageW={1920}
          pageH={2829}
          zoom={1.16}
          focus={{ x: 900, y: 900 }}
        />
      </div>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,9,11,.94) 0%, rgba(8,9,11,.74) 26%, rgba(8,9,11,.52) 54%, rgba(8,9,11,.9) 86%, rgba(8,9,11,.98) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, top: 140 }}>
        <MonoLabel color={C.green}>THE CLIENT SKILLS</MonoLabel>
        <div style={{ marginTop: 16, fontFamily: FONT_CN, fontSize: 62, color: C.text, fontWeight: 700 }}>
          甲方三件套
        </div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 348, display: "grid", gap: 18 }}>
        {items.map((item, index) => {
          const enter = spring({
            frame: frame - index * 12,
            fps: FPS,
            config: { damping: 15, stiffness: 100, mass: 0.9 },
          });
          return (
            <div
              key={item.title}
              style={{
                height: 246,
                borderRadius: 22,
                border: "1px solid #2D2D36",
                background: "linear-gradient(135deg, rgba(21,21,25,.94), rgba(12,12,15,.94))",
                boxShadow: "0 20px 54px rgba(0,0,0,.45)",
                display: "flex",
                alignItems: "center",
                gap: 32,
                padding: "26px 36px",
                opacity: enter,
                transform: `translateY(${(1 - enter) * 80}px)`,
              }}
            >
              <div
                style={{
                  width: 98,
                  height: 98,
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: index === 2 ? `${C.red}18` : `${C.amber}18`,
                  border: `1px solid ${index === 2 ? C.red : C.amber}55`,
                  color: index === 2 ? C.red : C.amber,
                  fontFamily: FONT_MONO,
                  fontSize: 48,
                }}
              >
                {item.glyph}
              </div>
              <div>
                <div style={{ fontFamily: FONT_CN, fontSize: 56, fontWeight: 700, color: C.text }}>{item.title}</div>
                <div style={{ marginTop: 8, fontFamily: FONT_CN, fontSize: 32, color: C.muted }}>{item.sub}</div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontFamily: FONT_MONO,
                  fontSize: 112,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "rgba(255,255,255,.055)",
                }}
              >
                0{index + 1}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 64, top: 1176 }}>
        <MonoLabel color={C.muted} style={{ fontSize: 21 }}>
          BACKLOT / 23 SCENES
        </MonoLabel>
      </div>
      <PageCrop
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        x={268}
        y={1415}
        w={1042}
        h={259}
        style={{
          position: "absolute",
          left: 64,
          top: 1214,
          width: 952,
          height: 237,
          borderRadius: 14,
          border: "1px solid #2A2A33",
          boxShadow: "0 18px 48px rgba(0,0,0,.5)",
        }}
      />
      <LowerScrim />
    </AbsoluteFill>
  );
};

const CursorFlyoverShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const stops = [
    { x: 270, y: 224, label: "通过" },
    { x: 551, y: 224, label: "打回" },
    { x: 833, y: 224, label: "通过" },
  ];
  const segment = Math.min(2, Math.floor((frame / Math.max(1, durationInFrames)) * 3));
  const local = ((frame / Math.max(1, durationInFrames)) * 3) % 1;
  const from = stops[Math.max(0, segment - 1)];
  const to = stops[segment];
  const moveP = interpolate(local, [0, 0.7], [0, 1], { ...clamp, easing: easeInOut });
  const x = interpolate(moveP, [0, 1], [from.x, to.x]);
  const y = interpolate(moveP, [0, 1], [from.y, to.y]);
  const click = local > 0.72 && local < 0.9 ? 1 : 0;
  const cursorPath = "M0 0 L0 34 L9 26 L16 42 L23 39 L16 23 L28 23 Z";
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        zoom={1.55}
        focus={{ x: 890, y: H / (2 * 1.55) }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 30%, rgba(8,9,11,.2) 52%, rgba(8,9,11,.86) 78%, rgba(8,9,11,.97) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 64, top: 700, width: 680 }}>
        <MonoLabel color={C.green}>FIVE APPROVALS / THREE QUESTIONS</MonoLabel>
        <div style={{ marginTop: 16, fontFamily: FONT_CN, fontSize: 58, fontWeight: 700, lineHeight: 1.18, color: C.text }}>
          五个审批点，
          <br />
          敢不敢打回重做？
        </div>
      </div>
      {stops.map((stop, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: stop.x,
            top: stop.y,
            width: 72,
            height: 72,
            marginLeft: -36,
            borderRadius: 99,
            border: `2px solid ${index === 1 ? C.red : C.green}`,
            background: "rgba(8,9,11,.5)",
            boxShadow: `0 0 28px ${index === 1 ? C.red : C.green}44`,
            opacity: segment >= index ? 1 : 0.2,
          }}
        >
          <div style={{ position: "absolute", top: 84, left: -20, width: 112, textAlign: "center", fontFamily: FONT_CN, fontSize: 28, color: index === 1 ? C.red : C.green }}>
            {stop.label}
          </div>
        </div>
      ))}
      <svg
        width="36"
        height="48"
        viewBox="0 0 28 48"
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${1 + click * 0.08})`,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,.6))",
        }}
      >
        <path d={cursorPath} fill="#F7F7F5" stroke="#111" strokeWidth="1.5" />
      </svg>
      {click ? (
        <div
          style={{
            position: "absolute",
            left: to.x - 58,
            top: to.y - 58,
            width: 116,
            height: 116,
            borderRadius: 99,
            border: `3px solid ${segment === 1 ? C.red : C.green}`,
            opacity: 0.7,
          }}
        />
      ) : null}
      <LowerScrim />
    </AbsoluteFill>
  );
};

const GateLedgerShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const gates = ["品味", "表达", "否决权"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <PageWindow
        src="textures/openmontage/board-full.png"
        pageW={1920}
        pageH={2829}
        zoom={1.24}
        focus={{ x: 1210, y: 1120 + p * 90 }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(8,9,11,.97) 0%, rgba(8,9,11,.9) 42%, rgba(8,9,11,.3) 72%, rgba(8,9,11,.55) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 60, top: 150, width: 700 }}>
        <MonoLabel color={C.amber}>JUDGMENT GATE / REAL LOG</MonoLabel>
        <div style={{ marginTop: 20, fontFamily: FONT_CN, fontSize: 62, fontWeight: 700, lineHeight: 1.16, color: C.text }}>
          执行门槛没了，
          <br />
          判断门槛立起来。
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          top: 586,
          width: 646,
          padding: "18px 26px",
          background: "rgba(8,9,11,.9)",
          borderLeft: `3px solid ${C.amber}`,
        }}
      >
        {gates.map((gate, index) => {
          const enter = spring({
            frame: frame - 14 - index * 10,
            fps: FPS,
            config: { damping: 16, stiffness: 115, mass: 0.8 },
          });
          return (
            <div
              key={gate}
              style={{
                height: 168,
                marginBottom: 14,
                borderTop: "1px solid #31313A",
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: enter,
                transform: `translateX(${(1 - enter) * -50}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: C.amber }}>0{index + 1}</div>
              <div style={{ fontFamily: FONT_CN, fontSize: 54, fontWeight: 700, color: C.text }}>{gate}</div>
              <div style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 24, color: index === 2 ? C.red : C.green }}>
                {index === 2 ? "REJECT" : "APPROVE"}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 338, display: "flex", gap: 12 }}>
        <Chip filled>5 个审批点</Chip>
        <Chip color={C.green}>通过</Chip>
        <Chip color={C.red}>打回</Chip>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const FinalQuestionShot: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const cards = ["story-card-01.png", "board-script.png", "story-card-04.png"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {cards.map((src, index) => (
        <div
          key={src}
          style={{
            position: "absolute",
            width: 320,
            height: 410,
            left: 40 + index * 340,
            top: 50 + index * 24,
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.1)",
            opacity: (1 - p) * 0.24 + 0.04,
            transform: `translateY(${-p * (80 + index * 40)}px) rotate(${(index - 1) * 2}deg)`,
          }}
        >
          <Img
            src={staticFile(`textures/openmontage/${src}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,9,11,.2) 0%, rgba(8,9,11,.9) 34%, #08090B 58%, #08090B 100%)" }} />
      <div style={{ position: "absolute", left: 68, right: 68, top: 690 }}>
        <MonoLabel color={C.amber}>OPEN QUESTION</MonoLabel>
        <div style={{ marginTop: 22, fontFamily: FONT_CN, fontSize: 96, fontWeight: 700, lineHeight: 1.12, color: C.text }}>
          你的答案？
        </div>
      </div>
      <div style={{ position: "absolute", left: 68, right: 68, top: 900, display: "flex", gap: 20 }}>
        {[
          { title: "消失", sub: "AI 替代", color: C.red },
          { title: "更强", sub: "AI 放大", color: C.green },
        ].map((option, index) => {
          const enter = spring({
            frame: frame - 10 - index * 8,
            fps: FPS,
            config: { damping: 15, stiffness: 110, mass: 0.8 },
          });
          return (
            <div
              key={option.title}
              style={{
                flex: 1,
                height: 286,
                borderRadius: 24,
                border: `2px solid ${option.color}66`,
                background: "rgba(16,16,19,.94)",
                padding: "42px 36px",
                opacity: enter,
                transform: `translateY(${(1 - enter) * 50}px)`,
              }}
            >
              <div style={{ fontFamily: FONT_CN, fontSize: 72, fontWeight: 700, color: C.text }}>{option.title}</div>
              <div style={{ marginTop: 12, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: "0.14em", color: option.color }}>
                {option.sub}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 68, right: 68, top: 1256, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 58, height: 2, background: C.amber }} />
        <div style={{ fontFamily: FONT_CN, fontSize: 34, color: C.muted }}>
          投票，或者在评论区说说你的想法
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 44,
          bottom: 340,
          fontFamily: FONT_MONO,
          fontSize: 360,
          fontWeight: 700,
          lineHeight: 0.8,
          color: "rgba(255,255,255,.045)",
        }}
      >
        ?
      </div>
      <div style={{ position: "absolute", left: 68, right: 68, bottom: 330 }}>
        <div style={{ fontFamily: FONT_CN, fontSize: 33, lineHeight: 1.5, color: C.muted }}>
          工具拆掉的是执行门槛，
          <br />
          立起来的是判断门槛。
        </div>
      </div>
      <LowerScrim />
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const ms = (frame / FPS) * 1000;
  const active = SHOTCRAFT_CAPTIONS.find(
    (caption) => ms >= caption.startMs && ms < caption.endMs,
  );
  if (!active) return null;
  const localStart = active.startMs / 1000;
  const localEnd = active.endMs / 1000;
  const t = frame / FPS;
  const opacity = Math.min(
    interpolate(t, [localStart, localStart + 0.08], [0, 1], clamp),
    interpolate(t, [localEnd - 0.08, localEnd], [1, 0], clamp),
  );
  const fontSize = active.word.length >= 14 ? 52 : 58;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 116,
        display: "flex",
        justifyContent: "center",
        opacity,
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontFamily: FONT_CN,
          fontSize,
          fontWeight: 500,
          lineHeight: 1.2,
          letterSpacing: "0.015em",
          color: "#F7F7F4",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {active.word}
      </div>
    </div>
  );
};

const worldBackground: React.CSSProperties = {
  backgroundColor: C.bg,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.024) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.024) 1px, transparent 1px)",
  backgroundSize: "64px 64px",
};

export type ShotcraftV6Props = {
  music?: boolean;
};

export const ShotcraftV6: React.FC<ShotcraftV6Props> = ({ music = true }) => {
  const { durationInFrames } = useVideoConfig();
  const scenes = [
    { from: 0, to: 6.4, node: <LibraryCraneShot durationInFrames={seconds(6.4)} /> },
    { from: 6.4, to: 11.756, node: <BoardIntroShot durationInFrames={seconds(4.856)} /> },
    { from: 11.756, to: 19.2, node: <StageRailShot durationInFrames={seconds(7.444)} /> },
    {
      from: 19.2,
      to: 26.2,
      node: (
        <ScriptScanShot
          src="script-modal-s2.png"
          durationInFrames={seconds(7)}
          focus={{ x: 500, y: 1000 }}
          tag="SCRIPT / S2 · WHY NOW"
          callout={{ value: "185%", label: "抖音 AI 内容投稿量", detail: "2025.11 → 2026.03" }}
        />
      ),
    },
    { from: 26.2, to: 31.8, node: <StoryboardPanShot durationInFrames={seconds(5.6)} /> },
    { from: 31.8, to: 37.144, node: <DecisionsPanShot durationInFrames={seconds(4.844)} /> },
    {
      from: 37.144,
      to: 44.6,
      node: (
        <ScriptScanShot
          src="script-modal-s3.png"
          durationInFrames={seconds(7.456)}
          focus={{ x: 500, y: 1180 }}
          tag="SCRIPT / S3 · SCOREBOARD"
          callout={{ value: "60万 / 78万", label: "两个账号，半个月 / 二十天", detail: "同一套流程，不是买量" }}
        />
      ),
    },
    { from: 44.6, to: 50.8, node: <EvidenceGrid durationInFrames={seconds(6.2)} /> },
    {
      from: 50.8,
      to: 54.8,
      node: (
        <ScriptScanShot
          src="script-modal-s4.png"
          durationInFrames={seconds(4)}
          focus={{ x: 500, y: 1450 }}
          tag="SCRIPT / S4 · FULL PIPELINE"
          callout={{ value: "AI 全流程", label: "查资料 · 写稿 · 分镜 · 配音", detail: "人只在 5 个关卡点做判断" }}
        />
      ),
    },
    { from: 54.8, to: 59.244, node: <ZeroThresholdShot durationInFrames={seconds(3.944)} /> },
    { from: 59.244, to: 65.4, node: <StageRailShot durationInFrames={seconds(6.156)} /> },
    { from: 65.4, to: 71.7, node: <TerminalShot durationInFrames={seconds(6.3)} /> },
    { from: 71.7, to: 76.2, node: <PageWaterfallShot durationInFrames={seconds(4.5)} /> },
    { from: 76.2, to: 80.456, node: <RenderHeroShot durationInFrames={seconds(3.756)} /> },
    { from: 80.456, to: 85.4, node: <OldFinalPlaybackShot durationInFrames={seconds(4.944)} /> },
    { from: 85.4, to: 91.2, node: <FailureFreezeShot durationInFrames={seconds(5.8)} /> },
    { from: 91.2, to: 96.6, node: <RunVsJudgeShot durationInFrames={seconds(5.4)} /> },
    { from: 96.6, to: 103.372, node: <TemplateFloodShot durationInFrames={seconds(6.272)} /> },
    {
      from: 103.372,
      to: 109.0,
      node: (
        <ScriptScanShot
          src="script-modal-s7.png"
          durationInFrames={seconds(5.628)}
          focus={{ x: 500, y: 1480 }}
          tag="SCRIPT / S6 · PLATFORM RULES"
          callout={{ value: "平台在扶持", label: "AI 知识内容", detail: "被压的是：低质 / 同质 / 不标注" }}
        />
      ),
    },
    { from: 109.0, to: 115.2, node: <PlatformRulesShot durationInFrames={seconds(6.2)} /> },
    { from: 115.2, to: 120.4, node: <ScarcityShot durationInFrames={seconds(5.2)} /> },
    { from: 120.4, to: 125.304, node: <DecisionsPanShot durationInFrames={seconds(4.404)} /> },
    { from: 125.304, to: 129.7, node: <AnswerIntroShot durationInFrames={seconds(4.396)} /> },
    { from: 129.7, to: 135.5, node: <CapabilityTriptychShot durationInFrames={seconds(5.8)} /> },
    { from: 135.5, to: 140.8, node: <CursorFlyoverShot durationInFrames={seconds(5.3)} /> },
    { from: 140.8, to: 148.296, node: <GateLedgerShot durationInFrames={seconds(7.496)} /> },
    { from: 148.296, to: 159.0, node: <FinalQuestionShot durationInFrames={seconds(10.58)} /> },
  ];

  return (
    <AbsoluteFill style={worldBackground}>
      {scenes.map((scene, index) => {
        const from = seconds(scene.from);
        const to = seconds(scene.to);
        return (
          <Sequence key={index} from={from} durationInFrames={Math.max(1, to - from)}>
            <Scene durationInFrames={Math.max(1, to - from)}>{scene.node}</Scene>
          </Sequence>
        );
      })}
      <Grain opacity={0.035} />
      <LowerScrim />
      <Captions />
      <Audio src={staticFile("textures/openmontage/narration_full_v3.mp3")} volume={1} />
      {music ? (
        <Audio
          src={staticFile("textures/openmontage/background_music.mp3")}
          loop
          loopVolumeCurveBehavior="repeat"
          volume={(frame) => {
            const fadeIn = interpolate(frame, [0, 60], [0, 0.085], clamp);
            const fadeOut = interpolate(frame, [durationInFrames - 150, durationInFrames], [0.085, 0], clamp);
            return Math.min(fadeIn, fadeOut);
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
