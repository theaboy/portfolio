import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { getSkillIcon } from "../data/skillIcons";
import type { GlobeRegion } from "../data/resumeSelectors";

type ResumeGlobeProps = { regions: GlobeRegion[] };

type PlanetSkill = {
  id: string;
  category: string;
  name: string;
  position: [number, number, number];
};

type PointerState = {
  pointerId: number | null;
  lastX: number;
  lastY: number;
  dragging: boolean;
};

const PLANET_RADIUS = 1.5;
const ROTATION_X_LIMIT = 0.7;
const DRAG_SENSITIVITY = 0.0055;
const IDLE_ROTATION_SPEED = 0.11;
const MAX_POINTER_STEP = 36;
const DESKTOP_LABEL_LIMIT = 14;

function clampRotationX(value: number) {
  return THREE.MathUtils.clamp(value, -ROTATION_X_LIMIT, ROTATION_X_LIMIT);
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
  onHoverStart: (skillId: string) => void;
  onHoverEnd: () => void;
  onSelect: (skillId: string, category: string) => void;
  registerNode: (skillId: string, node: HTMLButtonElement | null) => void;
  registerLabel: (skillId: string, node: HTMLSpanElement | null) => void;
};

function SkillNode({
  skill,
  isHighlighted,
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
          className={`skill-node ${isHighlighted ? "is-highlighted" : ""}`}
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
          {isHighlighted && (
            <span className="skill-tooltip" role="note">
              <strong>{skill.name}</strong>
              <small>{skill.category}</small>
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}

type GlobeSceneProps = {
  skills: PlanetSkill[];
  reducedMotion: boolean;
  isMobile: boolean;
  highlightedSkillId: string | null;
  onHoverStart: (skillId: string) => void;
  onHoverEnd: () => void;
  onSelectSkill: (skillId: string, category: string) => void;
};

function GlobeScene({
  skills,
  reducedMotion,
  isMobile,
  highlightedSkillId,
  onHoverStart,
  onHoverEnd,
  onSelectSkill,
}: GlobeSceneProps) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const pointerState = useRef<PointerState>({
    pointerId: null,
    lastX: 0,
    lastY: 0,
    dragging: false,
  });
  const rotationState = useRef({ x: 0.18, y: 0.36 });
  const angularVelocity = useRef({ x: 0, y: 0 });
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

  const applyRotationStep = (stepX: number, stepY: number) => {
    rotationState.current.x = clampRotationX(rotationState.current.x + stepX);
    rotationState.current.y += stepY;
  };

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    pointerState.current.pointerId = event.pointerId;
    pointerState.current.lastX = event.clientX;
    pointerState.current.lastY = event.clientY;
    pointerState.current.dragging = true;
    angularVelocity.current.x = 0;
    angularVelocity.current.y = 0;
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!pointerState.current.dragging || pointerState.current.pointerId !== event.pointerId) {
      return;
    }
    const dx = THREE.MathUtils.clamp(
      event.clientX - pointerState.current.lastX,
      -MAX_POINTER_STEP,
      MAX_POINTER_STEP
    );
    const dy = THREE.MathUtils.clamp(
      event.clientY - pointerState.current.lastY,
      -MAX_POINTER_STEP,
      MAX_POINTER_STEP
    );
    pointerState.current.lastX = event.clientX;
    pointerState.current.lastY = event.clientY;

    const stepY = dx * DRAG_SENSITIVITY;
    const stepX = dy * DRAG_SENSITIVITY;
    applyRotationStep(stepX, stepY);
    angularVelocity.current.x = stepX;
    angularVelocity.current.y = stepY;
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (pointerState.current.pointerId !== event.pointerId) {
      return;
    }
    pointerState.current.dragging = false;
    pointerState.current.pointerId = null;
    if (reducedMotion) {
      angularVelocity.current.x = 0;
      angularVelocity.current.y = 0;
    }
  };

  const registerNode = (skillId: string, node: HTMLButtonElement | null) => {
    nodeRefs.current[skillId] = node;
  };

  const registerLabel = (skillId: string, node: HTMLSpanElement | null) => {
    labelRefs.current[skillId] = node;
  };

  useFrame((_, delta) => {
    const damping = Math.pow(0.9, delta * 60);

    if (!pointerState.current.dragging) {
      if (!reducedMotion) {
        applyRotationStep(0, IDLE_ROTATION_SPEED * delta);
      }
      if (!reducedMotion) {
        applyRotationStep(angularVelocity.current.x, angularVelocity.current.y);
        angularVelocity.current.x *= damping;
        angularVelocity.current.y *= damping;
        if (Math.abs(angularVelocity.current.x) < 0.00001) angularVelocity.current.x = 0;
        if (Math.abs(angularVelocity.current.y) < 0.00001) angularVelocity.current.y = 0;
      }
    }

    const group = globeGroupRef.current;
    if (!group) return;

    group.rotation.x = rotationState.current.x;
    group.rotation.y = rotationState.current.y;

    const orderedByDepth = skills
      .map((skill) => {
        reusableVector.current.set(...skill.position).applyEuler(group.rotation);
        return { id: skill.id, depth: reusableVector.current.z };
      })
      .sort((a, b) => b.depth - a.depth);

    const visibleLabels = new Set(
      orderedByDepth.slice(0, mobileRef.current ? 0 : DESKTOP_LABEL_LIMIT).map((entry) => entry.id)
    );
    const highlighted = highlightedSkillRef.current;

    for (const entry of orderedByDepth) {
      const node = nodeRefs.current[entry.id];
      const label = labelRefs.current[entry.id];
      const frontness = THREE.MathUtils.clamp((entry.depth / PLANET_RADIUS + 0.24) / 1.24, 0, 1);
      const baseOpacity = 0.06 + frontness * 0.94;
      const scale = 0.6 + frontness * 0.58;

      if (node) {
        node.style.opacity = `${baseOpacity}`;
        node.style.transform = `scale(${scale})`;
        node.style.pointerEvents = frontness < 0.12 ? "none" : "auto";
      }

      if (label) {
        const shouldShowLabel = mobileRef.current
          ? highlighted === entry.id
          : visibleLabels.has(entry.id) && frontness > 0.28;
        label.style.opacity = shouldShowLabel ? "1" : "0";
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.36} />
      <directionalLight position={[2.8, 2.4, 2.8]} intensity={0.82} color="#dbe8ff" />
      <pointLight position={[-3.2, 0.8, -2.4]} intensity={0.6} color="#4a96ff" />

      <group ref={globeGroupRef}>
        <mesh onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerOut={onPointerUp}>
          <sphereGeometry args={[PLANET_RADIUS, 36, 36]} />
          <meshStandardMaterial color="#0c1b3d" roughness={0.42} metalness={0.11} />
        </mesh>
        <mesh scale={1.03}>
          <sphereGeometry args={[PLANET_RADIUS, 22, 22]} />
          <meshBasicMaterial color="#7cb5ff" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
        {skills.map((skill) => (
          <SkillNode
            key={skill.id}
            skill={skill}
            isHighlighted={highlightedSkillId === skill.id}
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

function ResumeGlobe({ regions }: ResumeGlobeProps) {
  const [activeCategory, setActiveCategory] = useState<string>(regions[0]?.category ?? "Programming");
  const [pinnedSkillId, setPinnedSkillId] = useState<string | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 48rem)");

  const skills = useMemo<PlanetSkill[]>(() => {
    const flattened = regions.flatMap((region) =>
      region.technologies.map((technology) => ({
        id: `${region.category}:${technology.technology}`,
        category: region.category,
        name: technology.technology,
      }))
    );
    const positions = buildFibonacciPositions(flattened.length, PLANET_RADIUS + 0.22);
    return flattened.map((skill, index) => ({ ...skill, position: positions[index] }));
  }, [regions]);

  const highlightedSkillId = hoveredSkillId ?? pinnedSkillId;

  const activeRegion = useMemo(
    () => regions.find((region) => region.category === activeCategory),
    [regions, activeCategory]
  );

  const handleSelectSkill = (skillId: string, category: string) => {
    setPinnedSkillId((current) => (current === skillId ? null : skillId));
    setActiveCategory(category);
  };

  return (
    <div className="globe-layout">
      <div className="globe" role="img" aria-label="Resume skills planet">
        {/* Previous globe was static CSS.
            Canvas + useFrame now drives continuous motion and depth-aware skill icon layout. */}
        <Canvas className="globe-canvas" dpr={[1, 1.75]} camera={{ position: [0, 0, 4.45], fov: 39 }}>
          <GlobeScene
            skills={skills}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
            highlightedSkillId={highlightedSkillId}
            onHoverStart={setHoveredSkillId}
            onHoverEnd={() => setHoveredSkillId(null)}
            onSelectSkill={handleSelectSkill}
          />
        </Canvas>
      </div>

      {activeRegion && (
        <article className="globe-panel" data-reveal>
          <p className="eyebrow">{activeRegion.category}</p>
          <ul className="globe-tech-list">
            {activeRegion.technologies.map((skill) => (
              <li key={skill.technology}>
                <h4>{skill.technology}</h4>
                <p>
                  Projects: {skill.projects.length > 0 ? skill.projects.map((p) => p.title).join(", ") : "None listed"}
                </p>
                <p>
                  Experience: {skill.experiences.length > 0 ? skill.experiences.map((e) => e.company).join(", ") : "None listed"}
                </p>
              </li>
            ))}
          </ul>
        </article>
      )}
    </div>
  );
}

export default ResumeGlobe;
