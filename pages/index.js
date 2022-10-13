import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Movable from "../components/Movable";
import Room from "../components/Room";

import { moveAtom } from "../atoms/moveAtom";
import { useAtom } from "jotai";
import Objects from "../components/Objects";

// softShadows();

export default function Home() {
	const [enabled] = useAtom(moveAtom);

	return (
		<div className="w-screen h-screen">
			<Canvas shadows camera={{ position: [5, 5, 5] }}>
				<ambientLight intensity={0.2} position={[0, 5, 0]} />
				<pointLight
					position={[0, 15, 0]}
					castShadow
					shadow-mapSize-height={2048} // set to 50 for cool retro effect xd
					shadow-mapSize-width={2048}
				/>

				<Room size={10} />

				<Objects />

				{/* <Movable scale={[2, 2, 2]}>
					<mesh castShadow position={[0, 1, 1]}>
						<boxBufferGeometry args={[2, 2, 2]} />
						<meshStandardMaterial color={"white"} />
					</mesh>
				</Movable> */}

				<OrbitControls enabled={enabled} enablePan={true} />
				{/* creo que deberia quitar el pan */}
			</Canvas>
		</div>
	);
}
