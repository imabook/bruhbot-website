import { SpringValue, animated, useSpring } from "@react-spring/three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	cloneElement,
} from "react";
import { OrbitControls, PointMaterial, Text, Text3D } from "@react-three/drei";
import * as THREE from "three";
import { Vector3 } from "three";

// softShadows();

export default function Home() {
	return (
		<div className="w-screen h-screen">
			<Canvas shadows={true} camera={{ position: [5, 5, 5] }}>
				<ambientLight intensity={0.2} position={[0, 5, 0]} />
				<pointLight
					position={[0, 15, 2]}
					castShadow={true}
					shadow-mapSize-height={2048} // set to 50 for cool retro effect xd
					shadow-mapSize-width={2048}
				/>
				{/*
				<Box size={[2, 2, 2]} color="orange" speed_multiplier={4}>
					<Box
						size={[1, 1, 1]}
						color="lightblue"
						offset={5}
						speed_multiplier={10}
					>
						<Box
							size={[0.4, 0.4, 0.4]}
							color="gray"
							offset={1.5}
							speed_multiplier={6000}
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
				</mesh> */}
				<Movable>
					<TestBox />
					<mesh position={[2, 0, 2]}>
						<boxBufferGeometry args={[1, 1, 1]} />
						<meshStandardMaterial color={"white"} />
					</mesh>
					<mesh position={[3, 0, 2]}>
						<boxBufferGeometry args={[1, 1, 1]} />
						<meshStandardMaterial color={"white"} />
					</mesh>
					<mesh position={[1, 1, 1]}>
						<sphereBufferGeometry args={[1, 32, 16]} />
						<meshStandardMaterial color={"white"} />
					</mesh>
				</Movable>

				<mesh className={"floor"} rotation={[-Math.PI / 2, 0, 0]}>
					<planeBufferGeometry args={[10, 10]} />
					<meshStandardMaterial color={"lightgray"} />
				</mesh>

				<mesh position={[0, 2.5, -5]}>
					<planeBufferGeometry args={[10, 5]} />
					<meshStandardMaterial color={"lightgray"} />
				</mesh>
				<mesh position={[0, 2.5, 5]} rotation={[0, Math.PI, 0]}>
					<planeBufferGeometry args={[10, 5]} />
					<meshStandardMaterial color={"lightgray"} />
				</mesh>
				<mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
					<planeBufferGeometry args={[10, 5]} />
					<meshStandardMaterial color={"lightgray"} />
				</mesh>
				<mesh position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
					<planeBufferGeometry args={[10, 5]} />
					<meshStandardMaterial color={"lightgray"} />
				</mesh>

				<OrbitControls />
			</Canvas>
		</div>
	);
}

function Ray() {
	// const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
	const ref = useRef();

	useFrame(state => {
		ref.current.setFromPoints([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(
				state.camera.position.z,
				state.camera.position.y,
				state.camera.position.x
			),
		]);
	});

	// useLayoutEffect(() => {
	// 	if (ref.current) {
	// 		ref.current.setFromPoints(points);
	// 	}
	// }, []);

	return (
		<line>
			<bufferGeometry
				attach={"geometry"}
				ref={ref}
				// geometry={lineGeometry}
				// setFromPoints={[
				// 	new THREE.Vector3(0, 10, 0),
				// 	new THREE.Vector3(0, 0, 0),
				// ]}
			/>
			<lineBasicMaterial
				attach={"material"}
				color={"red"}
				linewidth={100}
			/>
		</line>
	);
}

function TestBox({ color }) {
	console.log(color);

	return (
		<mesh>
			<boxBufferGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
}

function Movable({ children }) {
	const [selected, setSelected] = useState(false);
	const [color, setColor] = useState("white");
	const [pos, setPos] = useState([0, 0.5, 0]);

	const ref = useRef();

	useEffect(() => {
		console.log(color, selected);

		if (selected) {
			ref.current.children.forEach(o => o.material.color.set("orange"));
			return;
		}

		ref.current.children.forEach(o => o.material.color.set(color));
	}, [color, selected]);

	useFrame(state => {
		if (selected) {
			const floor = state.scene.children.find(
				e => e.className == "floor"
			);
			const collision = state.raycaster.intersectObject(floor);

			if (collision[0]) {
				// the 0.5 is the offset
				setPos(
					collision[0].point.add(new Vector3(0, 0.5, 0)).toArray()
				);
			}
		}
	});

	return (
		<mesh
			ref={ref}
			position={pos}
			onPointerEnter={_ => setColor("hotpink")}
			onPointerLeave={_ => setColor("white")}
			onClick={_ => {
				if (selected) {
					setColor("hotpink");
				} else {
					setColor("orange");
				}
				setSelected(!selected);
			}}
		>
			{children}
		</mesh>
	);
}

function Box({ size, color, speed_multiplier = 1, offset = 0, children }) {
	const [rotation, setRotation] = useState(0);
	const [isFinished, setFinish] = useState(false); // usar esto para programar un tiempo de espera antes de volver a animar las vueltas
	const { x } = useSpring({ x: 0 });

	useFrame(() => {
		console.log(x.isAnimating);

		if (x.isAnimating) {
			setRotation(x.get());
			return;
		}
		setRotation(rotation + 0.003 * speed_multiplier);
	});

	return (
		<animated.mesh
			rotation-y={rotation}
			position={[offset, 0, 0]}
			onClick={() => {
				x.start({
					from: rotation > 2 * Math.PI ? 2 * Math.PI : rotation,
					to: 0,
				});
			}}
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
		</animated.mesh>
	);
}
