import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
import type { IconType } from "react-icons";
import {
  SiAngular,
  SiBlender,
  SiC,
  SiCss3,
  SiDotnet,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiLinux,
  SiMysql,
  SiMongodb,
  SiPython,
  SiReact,
  SiSqlite,
  SiSpringboot,
} from "react-icons/si";
import { FaCircle, FaCode, FaDatabase, FaLanguage, FaServer } from "react-icons/fa";
import { DiCode, DiDatabase } from "react-icons/di";
import type { GlobeRegion, SkillUsage } from "../data/resumeSelectors";

type SkillsPlanetProps = { regions: GlobeRegion[] };

type PlanetSkill = {
  id: string;
  category: string;
  name: string;
  usage: SkillUsage;
  lat: number;
  lon: number;
  position: [number, number, number];
};

type InteractionState = {
  yaw: number;
  pitch: number;
  velocityYaw: number;
  velocityPitch: number;
  dragging: boolean;
  blockClickUntil: number;
};

type DragState = {
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  movedSq: number;
  active: boolean;
};

type EvidenceItem = {
  id: string;
  title: string;
  context: string;
  kind: "project" | "experience" | "academic" | "independent";
};

const PLANET_RADIUS = 1.38;
const MARKER_RADIUS = PLANET_RADIUS * 0.84;
const PITCH_LIMIT = 0.72;
const CLICK_DRAG_THRESHOLD_PX = 6;
const ROTATE_SENSITIVITY = 0.0049;
const CAMERA_Z = 5.8;
const CAMERA_FOV = 36;

function clampPitch(value: number) {
  return THREE.MathUtils.clamp(value, -PITCH_LIMIT, PITCH_LIMIT);
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const onChange = () => setMatches(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toShortLine(text: string, max = 110) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function buildSkillCoordinates(count: number, radius: number) {
  if (count <= 0) return [] as Array<{ lat: number; lon: number; position: [number, number, number] }>;

  const coords: Array<{ lat: number; lon: number; position: [number, number, number] }> = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const yUnit = 1 - (2 * (index + 0.5)) / count;
    const lat = Math.asin(yUnit);
    const lon = index * goldenAngle;

    const cosLat = Math.cos(lat);
    const x = radius * cosLat * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * cosLat * Math.sin(lon);

    coords.push({ lat, lon, position: [x, y, z] });
  }

  return coords;
}

type AnchorPoint = { lat: number; lon: number; position: [number, number, number] };

function buildSkillAnchors(count: number) {
  if (count <= 0) return [] as AnchorPoint[];

  const base = buildSkillCoordinates(count, 1);
  const candidates: Array<{ yaw: number; pitch: number }> = [];
  for (let yawStep = 0; yawStep < 72; yawStep += 1) {
    const yaw = (Math.PI * 2 * yawStep) / 72;
    for (let pitchStep = -4; pitchStep <= 4; pitchStep += 1) {
      const pitch = (pitchStep / 12) * Math.PI;
      candidates.push({ yaw, pitch });
    }
  }

  let best = { yaw: 0, pitch: 0, score: Number.NEGATIVE_INFINITY };

  for (const candidate of candidates) {
    const rotation = new THREE.Euler(candidate.pitch, candidate.yaw, 0, "YXZ");
    const rotated = base.map((anchor) => new THREE.Vector3(...anchor.position).applyEuler(rotation));
    const front = rotated.filter((v) => v.z > 0);
    if (front.length === 0) continue;

    const frontRatio = front.length / rotated.length;
    const meanX = front.reduce((sum, v) => sum + v.x, 0) / front.length;
    const meanY = front.reduce((sum, v) => sum + v.y, 0) / front.length;
    const frontFill = front.reduce((sum, v) => sum + Math.sqrt(v.x * v.x + v.y * v.y), 0) / front.length;
    const rimPenalty =
      front.reduce((sum, v) => {
        const r = Math.sqrt(v.x * v.x + v.y * v.y);
        return sum + (r > 0.92 ? r - 0.92 : 0);
      }, 0) / front.length;

    const score =
      frontRatio * 3 +
      frontFill * 0.7 -
      Math.abs(meanX) * 1.1 -
      Math.abs(meanY) * 0.8 -
      rimPenalty * 2.2;

    if (score > best.score) {
      best = { yaw: candidate.yaw, pitch: candidate.pitch, score };
    }
  }

  const rotation = new THREE.Euler(best.pitch, best.yaw, 0, "YXZ");

  return base.map((anchor) => {
    const v = new THREE.Vector3(...anchor.position).applyEuler(rotation).normalize();
    const lat = Math.asin(THREE.MathUtils.clamp(v.y, -1, 1));
    const lon = Math.atan2(v.z, v.x);
    return {
      lat,
      lon,
      position: [v.x, v.y, v.z] as [number, number, number],
    };
  });
}

function getIconForSkill(name: string, category: string): ReactNode {
  const normalized = name.trim().toLowerCase();
  let Icon: IconType | null = null;

  switch (normalized) {
    case "python":
      Icon = SiPython;
      break;
    case "numpy":
    case "pandas":
    case "matplotlib":
      Icon = SiPython;
      break;
    case "java":
      Icon = FaCode;
      break;
    case "c":
      Icon = SiC;
      break;
    case "sql":
      Icon = SiMysql;
      break;
    case "ocaml":
      Icon = DiCode;
      break;
    case "github":
    case "git":
      Icon = SiGithub;
      break;
    case "mongodb":
      Icon = SiMongodb;
      break;
    case "sqlite":
      Icon = SiSqlite;
      break;
    case "css":
    case "css3":
      Icon = SiCss3;
      break;
    case "angular":
      Icon = SiAngular;
      break;
    case "javascript":
      Icon = SiJavascript;
      break;
    case "html":
    case "html5":
      Icon = SiHtml5;
      break;
    case "spring boot":
      Icon = SiSpringboot;
      break;
    case "react":
      Icon = SiReact;
      break;
    case ".net":
      Icon = SiDotnet;
      break;
    case "linux":
      Icon = SiLinux;
      break;
    case "matlab":
      Icon = DiCode;
      break;
    case "n8n":
      Icon = FaServer;
      break;
    case "blender":
      Icon = SiBlender;
      break;
    case "photoshop":
      Icon = FaCode;
      break;
    case "sketchup":
      Icon = FaCode;
      break;
    case "english":
    case "french":
    case "arabic":
    case "spanish":
      Icon = FaLanguage;
      break;
    default:
      Icon =
        category === "Data & Scientific Computing"
          ? FaDatabase
          : category === "Web & Backend"
            ? FaServer
            : category === "Programming"
              ? DiCode
              : category === "Tools"
                ? DiDatabase
                : category === "Languages"
                  ? FaLanguage
                  : FaCircle;
  }

  return Icon ? <Icon className="marker-icon" aria-hidden="true" /> : null;
}

type SkillMarkerProps = {
  skill: PlanetSkill;
  isHighlighted: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onHoverStart: (skillId: string) => void;
  onHoverEnd: () => void;
  onSelect: (skillId: string, category: string) => void;
  registerNode: (skillId: string, node: HTMLButtonElement | null) => void;
};

const SkillMarker = memo(function SkillMarker({
  skill,
  isHighlighted,
  isSelected,
  hasSelection,
  onHoverStart,
  onHoverEnd,
  onSelect,
  registerNode,
}: SkillMarkerProps) {
  const icon = getIconForSkill(skill.name, skill.category);
  const showTooltip = isHighlighted || isSelected;

  return (
    <group position={skill.position}>
      <Html center style={{ overflow: "visible" }}>
        <div className="planet-marker-wrap planet-marker-anchor">
          <button
            ref={(node) => registerNode(skill.id, node)}
            type="button"
            className={`planet-marker ${isHighlighted ? "is-highlighted" : ""} ${isSelected ? "is-selected" : ""} ${hasSelection && !isSelected && !isHighlighted ? "is-muted" : ""}`}
            onMouseEnter={() => onHoverStart(skill.id)}
            onMouseLeave={onHoverEnd}
            onFocus={() => onHoverStart(skill.id)}
            onBlur={onHoverEnd}
            onClick={() => onSelect(skill.id, skill.category)}
            aria-label={`${skill.name} in ${skill.category}`}
          >
            {icon || (
              <span className="planet-marker-fallback">
                <span className="marker-dot" aria-hidden="true" />
              </span>
            )}
          </button>
          {showTooltip && <span className="planet-tooltip">{skill.name}</span>}
        </div>
      </Html>
    </group>
  );
});

type PlanetMarkersProps = {
  skills: PlanetSkill[];
  markerRadius: number;
  sharedGroupRef: MutableRefObject<THREE.Group | null>;
  reducedMotion: boolean;
  autoRotate: boolean;
  highlightedSkillId: string | null;
  focusedSkillId: string | null;
  interactionRef: MutableRefObject<InteractionState>;
  onHoverStart: (skillId: string) => void;
  onHoverEnd: () => void;
  onSelectSkill: (skillId: string, category: string) => void;
};

function PlanetMarkers({
  skills,
  markerRadius,
  sharedGroupRef,
  reducedMotion,
  autoRotate,
  highlightedSkillId,
  focusedSkillId,
  interactionRef,
  onHoverStart,
  onHoverEnd,
  onSelectSkill,
}: PlanetMarkersProps) {
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reusableVector = useRef(new THREE.Vector3());

  const registerNode = (skillId: string, node: HTMLButtonElement | null) => {
    nodeRefs.current[skillId] = node;
  };

  useFrame((_, delta) => {
    const interaction = interactionRef.current;

    if (!interaction.dragging) {
      const damping = Math.pow(0.92, delta * 60);
      if (autoRotate && !reducedMotion) {
        interaction.yaw += 0.13 * delta;
      }
      interaction.yaw += interaction.velocityYaw;
      interaction.pitch = clampPitch(interaction.pitch + interaction.velocityPitch);
      interaction.velocityYaw *= damping;
      interaction.velocityPitch *= damping;
    }

    const group = sharedGroupRef.current;
    if (!group) return;
    group.rotation.x = interaction.pitch;
    group.rotation.y = interaction.yaw;

    const markerCandidates = skills
      .map((skill) => {
        reusableVector.current.set(...skill.position).applyEuler(group.rotation);
        const depth = reusableVector.current.z;
        const frontness = THREE.MathUtils.clamp((depth + markerRadius) / (markerRadius * 2), 0, 1);
        const rimRatio = Math.sqrt(
          reusableVector.current.x * reusableVector.current.x +
            reusableVector.current.y * reusableVector.current.y
        ) / markerRadius;
        const rimSafety = THREE.MathUtils.clamp((1 - rimRatio) / 0.18, 0, 1);
        return { id: skill.id, depth, frontness, rimSafety };
      });

    for (const entry of markerCandidates) {
      const node = nodeRefs.current[entry.id];
      if (!node) continue;

      const hiddenBack = entry.depth < -0.06;
      const baseOpacity =
        THREE.MathUtils.lerp(0.24, 1, entry.frontness) *
        THREE.MathUtils.lerp(0.56, 1, entry.rimSafety);
      const opacity = hiddenBack ? 0.01 : baseOpacity;
      const scale =
        THREE.MathUtils.lerp(0.72, 1, entry.frontness) *
        THREE.MathUtils.lerp(0.76, 1, entry.rimSafety);

      node.style.opacity = `${opacity}`;
      node.style.setProperty("--marker-base-scale", `${scale}`);
      node.style.zIndex = `${Math.round((entry.depth + markerRadius) * 100)}`;
      node.style.pointerEvents = hiddenBack ? "none" : "auto";
    }
  });

  return (
    <>
      {skills.map((skill) => (
        <SkillMarker
          key={skill.id}
          skill={skill}
          isHighlighted={highlightedSkillId === skill.id}
          isSelected={focusedSkillId === skill.id}
          hasSelection={Boolean(focusedSkillId)}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          onSelect={onSelectSkill}
          registerNode={registerNode}
        />
      ))}
    </>
  );
}

function buildEvidence(skill: PlanetSkill): EvidenceItem[] {
  const projectEvidence = skill.usage.projects.map((project) => ({
    id: `project:${project.id}`,
    title: project.title,
    context: toShortLine(project.approach || project.problem),
    kind: "project" as const,
  }));

  const experienceEvidence = skill.usage.experiences.map((experience) => ({
    id: `experience:${experience.company}:${experience.role}`,
    title: `${experience.company} (${experience.role})`,
    context: toShortLine(experience.summary),
    kind: "experience" as const,
  }));

  const academicEvidence = skill.usage.academic.map((entry) => ({
    id: `academic:${entry.course}`,
    title: entry.course,
    context: toShortLine(entry.context),
    kind: "academic" as const,
  }));

  const independentEvidence = skill.usage.independent.map((entry) => ({
    id: `independent:${entry.title}`,
    title: entry.title,
    context: toShortLine(entry.context),
    kind: "independent" as const,
  }));

  return [...projectEvidence, ...experienceEvidence, ...academicEvidence, ...independentEvidence];
}

function SkillsPlanet({ regions }: SkillsPlanetProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [pinnedSkillId, setPinnedSkillId] = useState<string | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [isDraggingUi, setIsDraggingUi] = useState(false);

  const interactionRef = useRef<InteractionState>({
    yaw: 0,
    pitch: 0,
    velocityYaw: 0,
    velocityPitch: 0,
    dragging: false,
    blockClickUntil: 0,
  });

  const dragRef = useRef<DragState>({
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    movedSq: 0,
    active: false,
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sceneGroupRef = useRef<THREE.Group | null>(null);
  const markerSizePx = useMemo(() => {
    const minSide = Math.min(viewportSize.width, viewportSize.height);
    if (minSide <= 0) return 16;
    return clamp(minSide * 0.062, 22, 30);
  }, [viewportSize.height, viewportSize.width]);

  const markerRadius = MARKER_RADIUS;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const update = () => {
      setViewportSize({ width: node.clientWidth, height: node.clientHeight });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const skills = useMemo<PlanetSkill[]>(() => {
    const flattened = regions
      .flatMap((region) =>
        region.technologies.map((technology) => ({
          id: `${region.category}:${technology.technology}`,
          category: region.category,
          name: technology.technology,
          usage: technology,
        }))
      )
      .sort((a, b) => a.id.localeCompare(b.id));

    const anchors = buildSkillAnchors(flattened.length);
    return flattened.map((skill, index) => {
      const anchor = anchors[index];
      return {
        ...skill,
        lat: anchor.lat,
        lon: anchor.lon,
        position: [
          anchor.position[0] * markerRadius,
          anchor.position[1] * markerRadius,
          anchor.position[2] * markerRadius,
        ] as [number, number, number],
      };
    });
  }, [regions]);

  const activeSkillId = hoveredSkillId ?? pinnedSkillId;
  const activeSkill = useMemo(() => skills.find((skill) => skill.id === activeSkillId) ?? null, [skills, activeSkillId]);
  const evidence = useMemo(() => (activeSkill ? buildEvidence(activeSkill) : []), [activeSkill]);
  const usedInItems = evidence.map((item) => item.title);

  const getKindLabel = (kind: EvidenceItem["kind"]) => {
    if (kind === "project") return "Project";
    if (kind === "experience") return "Work";
    if (kind === "academic") return "Academic";
    return "Independent";
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.startX = event.clientX;
    dragRef.current.startY = event.clientY;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    dragRef.current.movedSq = 0;
    dragRef.current.active = true;
    interactionRef.current.dragging = true;
    viewportRef.current.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;

    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;
    const totalDx = event.clientX - dragRef.current.startX;
    const totalDy = event.clientY - dragRef.current.startY;

    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    dragRef.current.movedSq = totalDx * totalDx + totalDy * totalDy;

    const dragThresholdSq = CLICK_DRAG_THRESHOLD_PX * CLICK_DRAG_THRESHOLD_PX;
    if (!isDraggingUi && dragRef.current.movedSq > dragThresholdSq) {
      setIsDraggingUi(true);
      setHoveredSkillId(null);
    }

    interactionRef.current.yaw += dx * ROTATE_SENSITIVITY;
    interactionRef.current.pitch = clampPitch(interactionRef.current.pitch + dy * ROTATE_SENSITIVITY * 0.9);
    interactionRef.current.velocityYaw = dx * ROTATE_SENSITIVITY * 0.26;
    interactionRef.current.velocityPitch = dy * ROTATE_SENSITIVITY * 0.2;

    if (dragRef.current.movedSq > dragThresholdSq) {
      event.preventDefault();
    }
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId);
    }

    const wasDrag = dragRef.current.movedSq > CLICK_DRAG_THRESHOLD_PX * CLICK_DRAG_THRESHOLD_PX;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    interactionRef.current.dragging = false;
    interactionRef.current.blockClickUntil = wasDrag ? performance.now() + 150 : 0;
    setIsDraggingUi(false);
  };

  const handleSelectSkill = (skillId: string, _category: string) => {
    if (performance.now() < interactionRef.current.blockClickUntil) return;
    setPinnedSkillId(skillId);
  };

  return (
    <div className="planet-layout">
      <div className="planet-shell" data-reveal>
        <div className="planet-backdrop" aria-hidden="true" />
        <div
          ref={viewportRef}
          className={`planet-viewport ${isDraggingUi ? "is-dragging" : ""}`}
          style={{ ["--planet-marker-size" as string]: `${markerSizePx}px` }}
          role="img"
          aria-label="Interactive skills planet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <Canvas className="planet-canvas" dpr={[1, 1.75]} camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}>
            <ambientLight intensity={0.42} />
            <directionalLight position={[2.8, 2.2, 3.6]} intensity={1.26} color="#d7e9ff" />
            <pointLight position={[-2.9, -1.4, -2.5]} intensity={0.28} color="#4f8ce0" />
            <hemisphereLight args={["#c8e1ff", "#041022", 0.26]} />
            <group ref={sceneGroupRef}>
              <mesh>
                <sphereGeometry args={[PLANET_RADIUS, 56, 56]} />
                <meshStandardMaterial
                  color="#07142b"
                  roughness={0.68}
                  metalness={0.08}
                  emissive="#081a37"
                  emissiveIntensity={0.1}
                />
              </mesh>

              <mesh scale={1.003}>
                <sphereGeometry args={[PLANET_RADIUS, 24, 24]} />
                <meshBasicMaterial color="#8cc0ff" wireframe transparent opacity={0.14} />
              </mesh>

              <mesh scale={1.08}>
                <sphereGeometry args={[PLANET_RADIUS, 42, 42]} />
                <meshBasicMaterial
                  color="#70adff"
                  transparent
                  opacity={0.045}
                  side={THREE.BackSide}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              <PlanetMarkers
                skills={skills}
                markerRadius={markerRadius}
                sharedGroupRef={sceneGroupRef}
                reducedMotion={reducedMotion}
                autoRotate={autoRotate}
                highlightedSkillId={hoveredSkillId}
                focusedSkillId={pinnedSkillId}
                interactionRef={interactionRef}
                onHoverStart={setHoveredSkillId}
                onHoverEnd={() => setHoveredSkillId(null)}
                onSelectSkill={handleSelectSkill}
              />
            </group>
          </Canvas>
        </div>

        <label className="planet-toggle">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(event) => setAutoRotate(event.target.checked)}
            aria-label="Enable auto rotate"
          />
          Auto-rotate
        </label>
      </div>

      <article className="planet-panel" data-reveal>
        <div className="planet-panel-content" key={activeSkill?.id ?? "idle"}>
          {activeSkill ? (
            <>
            <p className="eyebrow">{activeSkill.category}</p>
            <h3>{activeSkill.name}</h3>

            {evidence.length > 0 && (
              <section className="planet-evidence-block">
                <p className="planet-evidence-title">Used in: {usedInItems.join(", ")}</p>
                <ul>
                  {evidence.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <span className="planet-evidence-kind">{getKindLabel(item.kind)}</span>: {item.context}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            </>
          ) : (
            <>
              <p className="eyebrow">Capability Mapping</p>
              <h3>Systems & ML Toolkit</h3>
              <p className="planet-evidence-empty">
                Technologies mapped directly to real-world projects and production experience.
              </p>
              <p className="planet-evidence-empty">Select a technology to inspect applied usage.</p>
            </>
          )}
        </div>
      </article>
    </div>
  );
}

export default SkillsPlanet;
