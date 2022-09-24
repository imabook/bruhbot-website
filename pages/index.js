import { useSpring, config, animated } from "@react-spring/three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { OrbitControls, PointMaterial, Text, Text3D } from "@react-three/drei";
import {
	BackSide,
	MeshPhongMaterial,
	MeshToonMaterial,
	Raycaster,
} from "three";

// softShadows();

export default function Home() {
	return (
		<div className="w-screen h-screen">
			<Canvas shadows={true}>
				<ambientLight intensity={0.2} position={[0, 5, 0]} />
				<pointLight
					position={[0, 15, 2]}
					castShadow={true}
					shadow-mapSize-height={2048}
					shadow-mapSize-width={2048}
				/>
				<Box size={[2, 2, 2]} color="orange">
					<Box
						size={[1, 1, 1]}
						color="lightblue"
						offset={5}
						speed_multiplier={2}
					>
						<Box
							size={[0.4, 0.4, 0.4]}
							color="gray"
							offset={1.5}
							speed_multiplier={4}
						/>
					</Box>
				</Box>

				<mesh
					receiveShadow={true}
					position={[0, -2, 0]}
					rotation={[Math.PI / 2, 0, 0]}
				>
					<planeBufferGeometry args={[50, 50]} />
					<shadowMaterial
						attach={"material"}
						opacity={0.3}
						side={BackSide}
					/>
				</mesh>

				<OrbitControls />
			</Canvas>
		</div>
	);
}

function Box({ size, color, speed_multiplier = 1, offset = 0, children }) {
	const [rotation, setRotation] = useState(0);

	useFrame(() => {
		console.log(rotation);

		setRotation(rotation + 0.003 * speed_multiplier);
	});

	return (
		<mesh
			rotation-y={rotation}
			position={[offset, 0, 0]}
			// onPointerEnter={() => setColor("hotpink")}
			// onPointerLeave={() => setColor("orange")}
		>
			<mesh
				rotation-x={-rotation}
				rotation-z={rotation}
				castShadow={true}
			>
				<boxGeometry args={size} rotateX={rotation} />
				<meshStandardMaterial color={color} rotateX={rotation} />
			</mesh>
			{children}
		</mesh>
	);
}
