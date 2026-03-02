import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import * as THREE from "three";
import { getSkillIcon } from "../data/skillIcons";
import type { GlobeRegion, SkillUsage } from "../data/resumeSelectors";

type ResumeGlobeProps = { regions: GlobeRegion[] };

type PlanetSkill = {
  id: string;
  category: string;
  name: string;
  usage: SkillUsage;
  position: [number, number, number];
};

type InteractionState = {
  yaw: number;
  pitch: number;
  velocityYaw: number;
  velocityPitch: number;
  dragging: boolean;
  blockClickUntil: number;
  lastDragEndedAt: number;
  focusTargetYaw: number | null;
  focusTargetPitch: number | null;
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

const PLANET_RADIUS = 1.5;
const PITCH_LIMIT = 0.68;
const CLICK_DRAG_THRESHOLD_PX = 6;
const ROTATE_SENSITIVITY = 0.0048;
const IDLE_ROTATION_SPEED = 0.08;
const DESKTOP_LABEL_LIMIT = 10;

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

function buildFibonacciPositions(count: number, radius: number): [number, number, number][] {
  if (count <= 0) return [];
  const points: [number, number, number][] = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = index * offset - 1 + offset / 2;
    const horizontal = Math.sqrt(1 - y * y);
    const phi = index * increment;
    const x = Math.cos(phi) * horizontal;
    const z = Math.sin(phi) * horizontal;
    points.push([x * radius, y * radius, z * radius]);
  }
  return points;
}

type SkillNodeProps = {
  skill: PlanetSkill;
  isHighlighted: boolean;
  isSelected: boolean;
  hasSelection: boolean;
  onHoverStart: (skillId: string) => void;
  onHoverEnd: () => void;
  onSelect: (skillId: string, category: string) => void;
  registerNode: (skillId: string, node: HTMLButtonElement | null) => void;
  registerLabel: (skillId: string, node: HTMLSpanElement | null) => void;
};

const SkillNode = memo(function SkillNode({
  skill,
  isHighlighted,
  isSelected,
  hasSelection,
  onHoverStart,
  onHoverEnd,
  onSelect,
  registerNode,
  registerLabel,
}: SkillNodeProps) {
  const icon = getSkillIcon(skill.name);
  const monogram = skill.name.slice(0, 1).toUpperCase();

  return (
    <group position={skill.position}>
      <Html transform sprite distanceFactor={8}>
        <button
          ref={(node) => registerNode(skill.id, node)}
          type="button"
          className={`skill-node ${isHighlighted ? "is-highlighted" : ""} ${isSelected ? "is-selected" : ""} ${hasSelection && !isHighlighted && !isSelected ? "is-muted" : ""}`}
          onMouseEnter={() => onHoverStart(skill.id)}
          onMouseLeave={onHoverEnd}
          onFocus={() => onHoverStart(skill.id)}
          onBlur={onHoverEnd}
          onClick={() => onSelect(skill.id, skill.category)}
          aria-label={`${skill.name} in ${skill.category}`}
        >
          <span className="skill-icon-shell">
            {icon ? (
              <img src={icon} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="skill-icon-fallback">{monogram}</span>
            )}
          </span>
          <span ref={(node) => registerLabel(skill.id, node)} className="skill-label">
            {skill.name}
          </span>
        </button>
      </Html>
    </group>
  );
});

type GlobeSceneProps = {
  skills: PlanetSkill[];
  reducedMotion: boolean;
  isMobile: boolean;
  highlightedSkillId: string | null;
  focusedSkillId: string | null;
  interactionRef: MutableRefObject<InteractionState>;
  globeRef: RefObject<HTMLDivElement | null>;
  onHoverStart: (skillId: string) => void;
  onHoverEnd: () => void;
  onSelectSkill: (skillId: string, category: string) => void;
};

function GlobeScene({
  skills,
  reducedMotion,
  isMobile,
  highlightedSkillId,
  focusedSkillId,
  interactionRef,
  globeRef,
  onHoverStart,
  onHoverEnd,
  onSelectSkill,
}: GlobeSceneProps) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const highlightedSkillRef = useRef<string | null>(highlightedSkillId);
  const mobileRef = useRef(isMobile);
  const reusableVector = useRef(new THREE.Vector3());

  useEffect(() => {
    highlightedSkillRef.current = highlightedSkillId;
  }, [highlightedSkillId]);
  useEffect(() => {
    mobileRef.current = isMobile;
  }, [isMobile]);

  const registerNode = (skillId: string, node: HTMLButtonElement | null) => {
    nodeRefs.current[skillId] = node;
  };
  const registerLabel = (skillId: string, node: HTMLSpanElement | null) => {
    labelRefs.current[skillId] = node;
  };

  useFrame((_, delta) => {
    const interaction = interactionRef.current;

    if (!interaction.dragging) {
      const damping = Math.pow(0.92, delta * 60);
      interaction.yaw += IDLE_ROTATION_SPEED * delta;
      if (!reducedMotion) {
        interaction.yaw += interaction.velocityYaw;
        interaction.pitch = clampPitch(interaction.pitch + interaction.velocityPitch);
        interaction.velocityYaw *= damping;
        interaction.velocityPitch *= damping;
      }

      if (
        interaction.focusTargetYaw !== null &&
        interaction.focusTargetPitch !== null &&
        performance.now() > interaction.lastDragEndedAt + 70
      ) {
        interaction.yaw = THREE.MathUtils.damp(interaction.yaw, interaction.focusTargetYaw, 6.2, delta);
        interaction.pitch = THREE.MathUtils.damp(interaction.pitch, interaction.focusTargetPitch, 6.2, delta);

        const yawDelta = Math.abs(interaction.yaw - interaction.focusTargetYaw);
        const pitchDelta = Math.abs(interaction.pitch - interaction.focusTargetPitch);
        if (yawDelta < 0.01 && pitchDelta < 0.01) {
          interaction.focusTargetYaw = null;
          interaction.focusTargetPitch = null;
        }
      }
    }

    const group = globeGroupRef.current;
    if (!group) return;
    group.rotation.x = interaction.pitch;
    group.rotation.y = interaction.yaw;

    const specX = 36 + Math.sin(interaction.yaw) * 11;
    const specY = 22 + interaction.pitch * 20;
    globeRef.current?.style.setProperty("--spec-x", `${specX}%`);
    globeRef.current?.style.setProperty("--spec-y", `${specY}%`);

    const orderedByDepth = skills
      .map((skill) => {
        reusableVector.current.set(...skill.position).applyEuler(group.rotation);
        const x = reusableVector.current.x;
        const y = reusableVector.current.y;
        const z = reusableVector.current.z;
        const rimDist = Math.sqrt(x * x + y * y) / PLANET_RADIUS;
        return { id: skill.id, depth: z, rimDist };
      })
      .sort((a, b) => b.depth - a.depth);

    const visibleLabels = new Set(
      orderedByDepth.slice(0, mobileRef.current ? 0 : DESKTOP_LABEL_LIMIT).map((entry) => entry.id)
    );
    const highlighted = highlightedSkillRef.current;

    for (const entry of orderedByDepth) {
      const node = nodeRefs.current[entry.id];
      const label = labelRefs.current[entry.id];
      const frontness = THREE.MathUtils.clamp((entry.depth + PLANET_RADIUS) / (PLANET_RADIUS * 2), 0, 1);
      const rimFactor = THREE.MathUtils.clamp(1 - (entry.rimDist - 0.55) / 0.5, 0, 1);
      const hiddenBack = entry.depth < -0.08;
      const opacity = hiddenBack ? 0.02 : THREE.MathUtils.clamp(frontness * (0.4 + rimFactor * 0.6), 0.08, 1);
      const scale = 0.38 + frontness * 0.46 * (0.8 + rimFactor * 0.2);

      if (node) {
        node.style.opacity = `${opacity}`;
        node.style.setProperty("--node-depth-scale", `${scale}`);
        node.style.zIndex = `${Math.round((entry.depth + PLANET_RADIUS) * 100)}`;
        node.style.pointerEvents = hiddenBack ? "none" : "auto";
      }

      if (label) {
        const shouldShowLabel = mobileRef.current
          ? highlighted === entry.id
          : visibleLabels.has(entry.id) && frontness > 0.62 && rimFactor > 0.34;
        label.style.opacity = shouldShowLabel ? "1" : "0";
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.34} />
      <directionalLight position={[2.6, 2.6, 3.2]} intensity={1} color="#e6f1ff" />
      <pointLight position={[-3.4, -0.2, -2.6]} intensity={0.66} color="#4a96ff" />

      <group ref={globeGroupRef}>
        <mesh>
          <sphereGeometry args={[PLANET_RADIUS, 44, 44]} />
          <meshStandardMaterial color="#0a1631" roughness={0.38} metalness={0.17} emissive="#08142b" emissiveIntensity={0.14} />
        </mesh>
        <mesh scale={1.022}>
          <sphereGeometry args={[PLANET_RADIUS, 20, 20]} />
          <meshBasicMaterial color="#8ec0ff" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
        {skills.map((skill) => (
          <SkillNode
            key={skill.id}
            skill={skill}
            isHighlighted={highlightedSkillId === skill.id}
            isSelected={focusedSkillId === skill.id}
            hasSelection={Boolean(focusedSkillId)}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            onSelect={onSelectSkill}
            registerNode={registerNode}
            registerLabel={registerLabel}
          />
        ))}
      </group>
    </>
  );
}

function toShortLine(text: string, max = 110) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function ResumeGlobe({ regions }: ResumeGlobeProps) {
  const [pinnedSkillId, setPinnedSkillId] = useState<string | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(regions[0]?.category ?? "Programming");
  const [selectionFeedback, setSelectionFeedback] = useState("Drag to rotate. Click a node to view mapped project evidence.");
  const [isDraggingUi, setIsDraggingUi] = useState(false);
  const [panelStage, setPanelStage] = useState<"in" | "out" | "loading">("in");
  const [panelSkillId, setPanelSkillId] = useState<string | null>(null);
  const globeRef = useRef<HTMLDivElement | null>(null);
  const pendingPanelSkillId = useRef<string | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 48rem)");

  const interactionRef = useRef<InteractionState>({
    yaw: 0.36,
    pitch: 0.18,
    velocityYaw: 0,
    velocityPitch: 0,
    dragging: false,
    blockClickUntil: 0,
    lastDragEndedAt: 0,
    focusTargetYaw: null,
    focusTargetPitch: null,
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

  const skills = useMemo<PlanetSkill[]>(() => {
    const flattened = regions.flatMap((region) =>
      region.technologies.map((technology) => ({
        id: `${region.category}:${technology.technology}`,
        category: region.category,
        name: technology.technology,
        usage: technology,
      }))
    );
    const positions = buildFibonacciPositions(flattened.length, PLANET_RADIUS + 0.22);
    return flattened.map((skill, index) => ({ ...skill, position: positions[index] }));
  }, [regions]);

  useEffect(() => {
    if (!skills.length) return;
    if (pinnedSkillId) return;
    const firstProjectBacked = skills.find((skill) => skill.usage.projects.length > 0) ?? skills[0];
    setPinnedSkillId(firstProjectBacked.id);
    setPanelSkillId(firstProjectBacked.id);
    setActiveCategory(firstProjectBacked.category);
  }, [skills, pinnedSkillId]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (panelStage === "out") {
      transitionTimeoutRef.current = window.setTimeout(() => setPanelStage("loading"), 170);
    } else if (panelStage === "loading") {
      transitionTimeoutRef.current = window.setTimeout(() => {
        if (pendingPanelSkillId.current) {
          setPanelSkillId(pendingPanelSkillId.current);
        }
        pendingPanelSkillId.current = null;
        setPanelStage("in");
      }, 220);
    }
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [panelStage]);

  const highlightedSkillId = hoveredSkillId ?? pinnedSkillId;
  const displaySkill = useMemo(() => {
    const preferred = skills.find((skill) => skill.id === panelSkillId && skill.usage.projects.length > 0);
    if (preferred) return preferred;
    return skills.find((skill) => skill.category === activeCategory && skill.usage.projects.length > 0) ?? null;
  }, [skills, panelSkillId, activeCategory]);
  const displayProject = useMemo(() => (displaySkill ? displaySkill.usage.projects[0] ?? null : null), [displaySkill]);

  const activeRegion = useMemo(
    () => regions.find((region) => region.category === activeCategory),
    [regions, activeCategory]
  );
  const relatedSkills = useMemo(() => {
    if (!activeRegion) return [];
    return activeRegion.technologies.filter((skill) => skill.projects.length > 0).slice(0, 7);
  }, [activeRegion]);

  const startPanelTransition = (skillId: string) => {
    if (skillId === panelSkillId) return;
    pendingPanelSkillId.current = skillId;
    setPanelStage("out");
  };

  const handleSelectSkill = (skillId: string, category: string) => {
    if (performance.now() < interactionRef.current.blockClickUntil) return;
    const selected = skills.find((item) => item.id === skillId);
    if (!selected) return;

    const [x, y, z] = selected.position;
    const targetYaw = Math.atan2(-x, z);
    const zAfterYaw = -x * Math.sin(targetYaw) + z * Math.cos(targetYaw);
    const targetPitch = clampPitch(Math.atan2(y, Math.max(0.001, zAfterYaw)));
    interactionRef.current.focusTargetYaw = targetYaw;
    interactionRef.current.focusTargetPitch = targetPitch;

    setPinnedSkillId(skillId);
    setActiveCategory(category);
    setSelectionFeedback(`${selected.name} selected`);
    startPanelTransition(skillId);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!globeRef.current) return;
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.startX = event.clientX;
    dragRef.current.startY = event.clientY;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    dragRef.current.movedSq = 0;
    dragRef.current.active = true;
    interactionRef.current.dragging = true;
    interactionRef.current.velocityYaw = 0;
    interactionRef.current.velocityPitch = 0;
    globeRef.current.setPointerCapture(event.pointerId);
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
    }

    interactionRef.current.yaw += dx * ROTATE_SENSITIVITY;
    interactionRef.current.pitch = clampPitch(interactionRef.current.pitch + dy * ROTATE_SENSITIVITY * 0.84);
    interactionRef.current.velocityYaw = dx * ROTATE_SENSITIVITY * 0.3;
    interactionRef.current.velocityPitch = dy * ROTATE_SENSITIVITY * 0.25;
    interactionRef.current.focusTargetYaw = null;
    interactionRef.current.focusTargetPitch = null;
    if (dragRef.current.movedSq > dragThresholdSq) {
      event.preventDefault();
    }
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    if (globeRef.current?.hasPointerCapture(event.pointerId)) {
      globeRef.current.releasePointerCapture(event.pointerId);
    }

    const wasDrag = dragRef.current.movedSq > CLICK_DRAG_THRESHOLD_PX * CLICK_DRAG_THRESHOLD_PX;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    interactionRef.current.dragging = false;
    interactionRef.current.lastDragEndedAt = performance.now();
    if (wasDrag) {
      interactionRef.current.blockClickUntil = performance.now() + 150;
      setHoveredSkillId(null);
    } else {
      interactionRef.current.blockClickUntil = 0;
    }
    setIsDraggingUi(false);
  };

  return (
    <div className="globe-layout">
      <div className="globe-shell">
        <div
          ref={globeRef}
          className={`globe ${isDraggingUi ? "is-dragging" : ""}`}
          role="img"
          aria-label="Resume skills planet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <Canvas className="globe-canvas" dpr={[1, 1.75]} camera={{ position: [0, 0, 4.45], fov: 39 }}>
            <GlobeScene
              skills={skills}
              reducedMotion={reducedMotion}
              isMobile={isMobile}
              highlightedSkillId={highlightedSkillId}
              focusedSkillId={pinnedSkillId}
              interactionRef={interactionRef}
              globeRef={globeRef}
              onHoverStart={setHoveredSkillId}
              onHoverEnd={() => setHoveredSkillId(null)}
              onSelectSkill={handleSelectSkill}
            />
          </Canvas>
        </div>
      </div>
      <p className="globe-feedback-outer">{selectionFeedback}</p>

      {activeRegion && displaySkill && displayProject && (
        <article className={`globe-panel panel-${panelStage}`} data-reveal>
          <p className="eyebrow">{activeRegion.category}</p>
          {panelStage === "loading" ? (
            <div className="panel-loading" aria-live="polite">
              <span>Updating</span>
              <span className="typing-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : (
            <div className="panel-content">
              <div className="skill-detail-panel" key={displaySkill.id}>
                <h3>{displaySkill.name}</h3>
                <p className="skill-detail-meta">
                  Used in: <strong>{displayProject.title}</strong>
                </p>
                <p className="skill-detail-meta">
                  Context: {toShortLine(displayProject.approach || displayProject.problem)}
                </p>
              </div>

              {relatedSkills.length > 0 && (
                <div className="related-skill-list" aria-label="Project-mapped skills">
                  {relatedSkills.map((skill) => {
                    const skillId = `${activeRegion.category}:${skill.technology}`;
                    const selected = displaySkill.id === skillId;
                    return (
                      <button
                        key={skill.technology}
                        type="button"
                        className={`related-skill-chip ${selected ? "is-active" : ""}`}
                        onClick={() => handleSelectSkill(skillId, activeRegion.category)}
                      >
                        {skill.technology}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </article>
      )}
    </div>
  );
}

export default ResumeGlobe;
