import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Movable from "../components/Movable";
import Room from "../components/Room";

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

				<Room size={10} />

				<Movable>
					<mesh position={[0, 0.5, 0]}>
						<boxBufferGeometry args={[1, 1, 1]} />
						<meshStandardMaterial color={"white"} />
					</mesh>
				</Movable>

				<OrbitControls />
			</Canvas>
		</div>
	);
}
