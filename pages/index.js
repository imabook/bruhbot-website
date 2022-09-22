import { useSpring, config, animated } from "@react-spring/three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export default function Home() {
	return (
		<div className="w-screen h-screen">
			<Canvas>
				<ambientLight intensity={0.1} />
				<directionalLight color="red" position={[0, 0, 5]} />

				<Box />
			</Canvas>
		</div>
	);
}

function Box() {
	const boxRef = useRef();

	const [active, setActive] = useState(true);
	const { rotation } = useSpring({
		rotation: active ? 0 : Math.PI / 2,
		config: config.wobbly,
	});

	useFrame(() => {
		console.log(boxRef.current.rotation);

		boxRef.current.rotation.x += 0.001;
		boxRef.current.rotation.y += 0.01;
		boxRef.current.rotation.z += 0.001;
	});

	return (
		<animated.mesh
			ref={boxRef}
			rotation-x={rotation}
			rotation-y={rotation}
			rotation-z={rotation}
			onClick={() => setActive(!active)}
		>
			<boxGeometry args={[2, 2, 2]} />
			<meshStandardMaterial />
		</animated.mesh>
	);
}
